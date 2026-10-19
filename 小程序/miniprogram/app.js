// # 拼豆工坊小程序主入口与云开发初始化
App({
  globalData: {
    currentPattern: null, // # 当前编辑的图纸数据
    paletteBrand: 'MARD', // # 默认当前色卡品牌
    hasShownSplash: false, // # 冷启动开屏动画单次标记
  },

  onLaunch() {
    if (!wx.cloud) {
      console.warn('当前基础库不支持云能力'); // # 基础库提示
    } else {
      try {
        wx.cloud.init({
          traceUser: true, // # 追踪用户访问记录
        });
      } catch (err) {
        console.warn('云开发初始化异常', err); // # 容错保护
      }
    }
  }
});

