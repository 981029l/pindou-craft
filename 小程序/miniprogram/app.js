// # 拼豆工坊小程序主入口 (自建独立后端模式)
const api = require('./utils/api.js');

App({
  globalData: {
    currentPattern: null, // # 当前编辑的图纸数据
    paletteBrand: 'MARD', // # 默认当前色卡品牌
    hasShownSplash: false, // # 冷启动开屏动画单次标记
  },

  onLaunch() {
    // # 冷启动时自动检测或静默换取自建后端登录 Token
    if (!api.getToken()) {
      api.login().catch(err => {
        console.log('[App] 首次启动静默鉴权待就绪 (将在保存时触发):', err.message);
      });
    }
  }
});
