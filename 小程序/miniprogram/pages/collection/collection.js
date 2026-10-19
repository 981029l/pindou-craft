// # 二级全量图纸作品库管理逻辑
const { generateGridThumbnail } = require('../../utils/thumbnailHelper.js'); // # 离屏缩略图引擎
const { PRESET_PATTERNS } = require('../../utils/presetPatterns.js'); // # 官方图纸底座

Page({
  data: {
    allPatterns: [],
    displayedList: [],
    leftList: [],
    rightList: [],
    allCount: 0,
    publicCount: 0,
    privateCount: 0,
    activeFilter: 'all', // # all | public | private
    searchQuery: '',
    loading: false
  },

  onLoad(options) {
    if (options.filter) {
      this.setData({ activeFilter: options.filter });
    }
  },

  onShow() {
    this.fetchPatterns();
  },

  onPullDownRefresh() {
    this.fetchPatterns(() => {
      wx.stopPullDownRefresh();
    });
  },

  async fetchPatterns(callback) {
    const fallbackSample = (PRESET_PATTERNS && PRESET_PATTERNS.length > 6) ? [{
      ...PRESET_PATTERNS[6],
      displayName: '浪漫双层像素爱心 [入门范例]',
      isPublic: true,
      likes: 68
    }] : [];

    if (!wx.cloud) {
      this.data.allPatterns = fallbackSample.map(item => ({
        ...item,
        displayThumb: item.previewUrl || (item.gridData ? generateGridThumbnail(item.gridData, item.paletteBrand) : ''),
        displaySize: `${item.width}×${item.height}`,
        createTimeFormatted: '今日'
      }));
      this.applyFilterAndSearch();
      this.setData({ loading: false });
      if (callback) callback();
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'getPatternList',
        data: { type: 'my' }
      });

      const list = (res.result && res.result.data) || [];
      let effectiveList = list;
      if (list.length === 0 && fallbackSample.length > 0) {
        effectiveList = fallbackSample;
      }

      const formatted = effectiveList.map((item, idx) => {
        const d = new Date(item.createTime || Date.now());
        const w = item.width || (item.gridData && item.gridData[0] ? item.gridData[0].length : 50);
        const h = item.height || (item.gridData ? item.gridData.length : 50);
        const displayName = item.displayName || item.name || `拼豆图纸 #${idx + 1}`;
        const displayThumb = item.previewUrl || (item.gridData ? generateGridThumbnail(item.gridData, item.paletteBrand) : '');

        return {
          ...item,
          displayName,
          displayThumb,
          displaySize: `${w}×${h}`,
          createTimeFormatted: `${d.getMonth() + 1}/${d.getDate()}`
        };
      });

      this.data.allPatterns = formatted;
      this.applyFilterAndSearch();
    } catch (err) {
      console.warn('fetchPatterns cloud error, fallback to sample', err);
      this.data.allPatterns = fallbackSample.map(item => ({
        ...item,
        displayThumb: item.previewUrl || (item.gridData ? generateGridThumbnail(item.gridData, item.paletteBrand) : ''),
        displaySize: `${item.width}×${item.height}`,
        createTimeFormatted: '今日'
      }));
      this.applyFilterAndSearch();
    } finally {
      this.setData({ loading: false });
      if (callback) callback();
    }
  },

  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value }, () => {
      this.applyFilterAndSearch();
    });
  },

  onClearSearch() {
    this.setData({ searchQuery: '' }, () => {
      this.applyFilterAndSearch();
    });
  },

  onResetFilterToAll() {
    this.setData({ activeFilter: 'all', searchQuery: '' }, () => {
      this.applyFilterAndSearch();
    });
  },

  onGoToWorkbench() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  onSwitchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (filter === this.data.activeFilter) return;
    this.setData({ activeFilter: filter }, () => {
      this.applyFilterAndSearch();
    });
  },

  applyFilterAndSearch() {
    const list = this.data.allPatterns;
    const filter = this.data.activeFilter;
    const query = (this.data.searchQuery || '').trim().toLowerCase();

    let allCount = list.length;
    let publicCount = 0;
    let privateCount = 0;

    list.forEach(item => {
      if (item.isPublic) publicCount++;
      else privateCount++;
    });

    // # 1. 分类筛选
    let filtered = list;
    if (filter === 'public') {
      filtered = filtered.filter(item => item.isPublic);
    } else if (filter === 'private') {
      filtered = filtered.filter(item => !item.isPublic);
    }

    // # 2. 搜索关键词
    if (query) {
      filtered = filtered.filter(item => (item.displayName || '').toLowerCase().includes(query));
    }

    // # 3. 双轨瀑布流分流
    const leftList = [];
    const rightList = [];
    filtered.forEach((item, idx) => {
      if (idx % 2 === 0) leftList.push(item);
      else rightList.push(item);
    });

    this.setData({
      displayedList: filtered,
      leftList,
      rightList,
      allCount,
      publicCount,
      privateCount
    });
  },

  onPreviewThumb(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  onLoadPattern(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.allPatterns.find(p => p._id === id);
    if (!item || !item.gridData) return;

    const app = getApp();
    app.globalData.currentPattern = {
      gridData: item.gridData,
      paletteBrand: item.paletteBrand || 'MARD',
      name: item.displayName || item.name
    };

    wx.showToast({ title: '已载入工作台！', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 350);
  },

  async onTogglePublish(e) {
    const { id, public: isPub } = e.currentTarget.dataset;
    if (!id) return;

    const nextPub = !isPub;
    wx.showLoading({ title: nextPub ? '正在公开...' : '正在隐藏...' });

    try {
      await wx.cloud.callFunction({
        name: 'togglePublish',
        data: { patternId: id, isPublic: nextPub }
      });
      wx.hideLoading();
      wx.showToast({ title: nextPub ? '已公开至社区' : '已设为私密', icon: 'success' });

      // # 更新本地状态
      this.data.allPatterns = this.data.allPatterns.map(item => item._id === id ? { ...item, isPublic: nextPub } : item);
      this.applyFilterAndSearch();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'error' });
    }
  },

  onDeletePattern(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这幅图纸吗？删除后不可恢复。',
      confirmText: '确定删除',
      confirmColor: '#DC2626',
      cancelText: '取消',
      cancelColor: '#78716C',
      success: async (res) => {
        if (res.confirm) {
          // # 乐观即时剔除
          this.data.allPatterns = this.data.allPatterns.filter(item => item._id !== id);
          this.applyFilterAndSearch();
          wx.showToast({ title: '已删除', icon: 'success' });

          try {
            await wx.cloud.callFunction({
              name: 'deletePattern',
              data: { patternId: id, id: id }
            });
          } catch (err) {
            console.error('Delete failed', err);
          }
        }
      }
    });
  }
});
