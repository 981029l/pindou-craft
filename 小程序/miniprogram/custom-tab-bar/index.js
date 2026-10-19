// # 极光流体胶囊 TabBar 逻辑
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {
    selected: 0,
    isStretching: false,
    isDimmed: false,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "工作台",
        iconClass: "icon-palette"
      },
      {
        pagePath: "/pages/community/community",
        text: "社区",
        iconClass: "icon-sparkles"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的",
        iconClass: "icon-cloud"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const targetIndex = Number(data.index);
      const url = data.path;

      if (targetIndex === this.data.selected) return;

      // # 触发流体形变（Squash & Stretch）
      this.setData({
        isStretching: true,
        selected: targetIndex
      });

      setTimeout(() => {
        this.setData({ isStretching: false });
      }, 240);

      wx.switchTab({ url });
    }
  }
});
