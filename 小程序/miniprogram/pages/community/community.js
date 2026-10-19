// # 拼豆社区广场逻辑
const { generateGridThumbnail } = require('../../utils/thumbnailHelper.js'); // # 离屏缩略图自愈引擎
const { PRESET_PATTERNS } = require('../../utils/presetPatterns.js'); // # 官方精选图纸底座
const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    allPatterns: [],
    displayPatternList: [],
    leftList: [],
    rightList: [],
    loading: false,
    sortBy: 'likes', // # 默认热门优先，展现高活跃精选图库
    searchKeyword: '',
    currentCategory: 'all' // # all | anime | pets | game | festival | mini
  },

  onShow() {
    this.fetchCommunityList();
  },

  onPullDownRefresh() {
    this.fetchCommunityList(() => {
      wx.stopPullDownRefresh();
    });
  },

  onSwitchSort(e) {
    const sort = e.currentTarget.dataset.sort;
    if (sort === this.data.sortBy) return;
    this.setData({ sortBy: sort }, () => {
      this.sortAndLayoutList();
    });
  },

  onSearchInput(e) {
    const val = (e.detail.value || '').trim();
    this.setData({ searchKeyword: val });
    this.filterAndLayoutPatterns();
  },

  onSearchConfirm() {
    this.filterAndLayoutPatterns();
  },

  onClearSearch() {
    this.setData({ searchKeyword: '' });
    this.filterAndLayoutPatterns();
  },

  onSelectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat });
    this.filterAndLayoutPatterns();
  },

  onResetFilter() {
    this.setData({
      searchKeyword: '',
      currentCategory: 'all'
    });
    this.filterAndLayoutPatterns();
  },

  // # 按排序规则重新对 allPatterns 排序并分流瀑布流
  sortAndLayoutList() {
    const { sortBy, allPatterns } = this.data;
    const sorted = [...allPatterns].sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      } else {
        return (b.createTime || 0) - (a.createTime || 0);
      }
    });
    this.setData({ allPatterns: sorted }, () => {
      this.filterAndLayoutPatterns();
    });
  },

  filterAndLayoutPatterns() {
    const { allPatterns, searchKeyword, currentCategory } = this.data;
    const kw = searchKeyword.toLowerCase();

    const filtered = allPatterns.filter(item => {
      if (kw) {
        const name = (item.displayName || item.name || '').toLowerCase();
        const author = (item.authorName || '').toLowerCase();
        const tagStr = ((item.tags || []).join(' ')).toLowerCase();
        if (!name.includes(kw) && !author.includes(kw) && !tagStr.includes(kw)) {
          return false;
        }
      }

      if (currentCategory && currentCategory !== 'all') {
        const text = `${item.displayName || item.name || ''} ${item.authorName || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
        const w = item.width || 50;
        const h = item.height || 50;
        const cat = item.category || '';

        if (currentCategory === 'anime') {
          return cat === 'anime' || /动漫|二次元|少女|角色|原神|明日方舟|宝可梦|卡比|海贼|初音|miku|鸣人|柯南|鬼灭|火影|皮卡丘/i.test(text);
        } else if (currentCategory === 'pets') {
          return cat === 'pets' || /猫|狗|宠物|兔|熊|鸟|狐狸|动物|仓鼠|小熊|小猫|小狗|柴犬|橘猫/i.test(text);
        } else if (currentCategory === 'game') {
          return cat === 'game' || /游戏|像素|马里奥|塞尔达|我的世界|minecraft|宝可梦|街机|怪兽|幽灵|吃豆人|掌机|蘑菇/i.test(text);
        } else if (currentCategory === 'festival') {
          return cat === 'festival' || /节日|新年|圣诞|万圣|爱心|生日|福|元宵|春|圣诞树/i.test(text);
        } else if (currentCategory === 'mini') {
          return cat === 'mini' || (w <= 35 && h <= 35) || /迷你|微缩|挂件|小件|钥匙扣|简易|胸针|随行杯|咖啡/i.test(text);
        }
      }

      return true;
    });

    const leftList = [];
    const rightList = [];
    filtered.forEach((item, idx) => {
      if (idx % 2 === 0) leftList.push(item);
      else rightList.push(item);
    });

    this.setData({
      displayPatternList: filtered,
      leftList,
      rightList
    });
  },

  // # 生成格式化的官方精选预置图纸列表
  getFormattedPresets() {
    return PRESET_PATTERNS.map((item) => {
      const d = new Date(item.createTime || Date.now());
      const w = item.width || 16;
      const h = item.height || 16;
      const displayThumb = item.displayThumb || (item.gridData ? generateGridThumbnail(item.gridData, item.paletteBrand) : '');
      const isLiked = wx.getStorageSync(`pindou_liked_${item._id}`) === true;

      return {
        ...item,
        displayName: item.name,
        displayThumb,
        displaySize: `${w}×${h}`,
        createTimeFormatted: `${d.getMonth() + 1}/${d.getDate()}`,
        isLiked,
        isOfficial: true
      };
    });
  },

  async fetchCommunityList(callback) {
    const presetList = this.getFormattedPresets();
    this.setData({ loading: true });

    try {
      const res = await api.getPatternList({
        type: 'community',
        sortBy: this.data.sortBy
      });

      const cloudList = res.data || [];

      const formattedCloud = cloudList.map((item, idx) => {
        const d = new Date(item.createTime || Date.now());
        const w = item.width || (item.gridData && item.gridData[0] ? item.gridData[0].length : 50);
        const h = item.height || (item.gridData ? item.gridData.length : 50);
        const displayName = item.name || `拼豆灵感 #${idx + 1}`;
        const rawThumb = item.previewUrl ? config.formatImageUrl(item.previewUrl) : '';
        const displayThumb = rawThumb || (item.gridData ? generateGridThumbnail(item.gridData, item.paletteBrand) : '');

        return {
          ...item,
          displayName,
          displayThumb,
          displaySize: `${w}×${h}`,
          createTimeFormatted: `${d.getMonth() + 1}/${d.getDate()}`,
          isOfficial: false
        };
      });

      // # 融合：自建服务端图纸在前，官方精选图纸在后（自动按 _id 去重）
      const seenIds = new Set();
      const merged = [];

      formattedCloud.forEach(item => {
        if (!seenIds.has(item._id)) {
          seenIds.add(item._id);
          merged.push(item);
        }
      });

      presetList.forEach(item => {
        if (!seenIds.has(item._id)) {
          seenIds.add(item._id);
          merged.push(item);
        }
      });

      this.setData({
        allPatterns: merged,
        loading: false
      });
      this.sortAndLayoutList();
    } catch (err) {
      console.warn('fetchCommunityList api err, fallback to presets', err);
      // # 服务端连接异常时直接使用官方精选图纸底座，杜绝空白
      this.setData({
        allPatterns: presetList,
        loading: false
      });
      this.sortAndLayoutList();
    } finally {
      if (callback) callback();
    }
  },

  onGoToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  async onLikePattern(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    const updateItem = (list) => list.map(item => {
      if (item._id === id) {
        if (item.isLiked) return item;
        return {
          ...item,
          likes: (item.likes || 0) + 1,
          isLiked: true
        };
      }
      return item;
    });

    const newAll = updateItem(this.data.allPatterns);
    const newDisplay = updateItem(this.data.displayPatternList);
    const newLeft = updateItem(this.data.leftList);
    const newRight = updateItem(this.data.rightList);

    this.setData({
      allPatterns: newAll,
      displayPatternList: newDisplay,
      leftList: newLeft,
      rightList: newRight
    });

    wx.setStorageSync(`pindou_liked_${id}`, true);
    wx.showToast({ title: '灵感点赞 +1', icon: 'success' });

    // # 若非官方本地预置，同步服务端点赞原子递增
    if (!id.startsWith('preset_')) {
      api.likePattern(id).catch(err => console.error('[Community like error]', err));
    }
  },

  onLoadToWorkbench(e) {
    const id = e.currentTarget.dataset.id;
    let item = this.data.allPatterns.find(p => p._id === id);
    if (!item) {
      const idx = e.currentTarget.dataset.index;
      item = this.data.displayPatternList[idx];
    }
    if (!item || !item.gridData) return;

    const app = getApp();
    app.globalData.currentPattern = {
      gridData: item.gridData,
      paletteBrand: item.paletteBrand || 'MARD',
      name: item.displayName || item.name,
      _id: item._id
    };

    if (!item._id.startsWith('preset_')) {
      api.recordDownload(item._id).catch(() => {});
    }

    wx.showToast({ title: '已载入工作台！', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 350);
  }
});
