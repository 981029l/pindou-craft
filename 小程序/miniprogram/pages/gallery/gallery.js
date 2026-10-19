// # 作品集列表页面逻辑 (自建独立后端模式)
const api = require('../../utils/api.js');

Page({
  data: {
    patternList: [],
    loading: false
  },

  onShow() {
    this.fetchPatternList();
  },

  onPullDownRefresh() {
    this.fetchPatternList(() => {
      wx.stopPullDownRefresh();
    });
  },

  async fetchPatternList(callback) {
    this.setData({ loading: true });
    try {
      const res = await api.getPatternList({ type: 'my' });
      const list = res.data || [];
      const formatted = list.map(item => {
        const d = new Date(item.createTime || Date.now());
        return {
          ...item,
          createTimeFormatted: `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}`
        };
      });

      this.setData({ patternList: formatted, loading: false });
    } catch (err) {
      console.error(err);
      this.setData({ loading: false });
    } finally {
      if (callback) callback();
    }
  },

  onLoadPattern(e) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.patternList[idx];
    if (!item) return;

    const app = getApp();
    app.globalData.currentPattern = item;

    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  async onDeletePattern(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要从作品集删除这幅拼豆图纸吗？',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          wx.showLoading({ title: '正在删除...' });
          try {
            await api.deletePattern(id);
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            this.fetchPatternList();
          } catch (err) {
            console.error(err);
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onGoToWorkbench() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
