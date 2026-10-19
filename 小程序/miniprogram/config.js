// # 拼豆工坊自建后端环境配置文件
const config = {
  // # 1. 独立后端 API 基础请求路径 (微信小程序正式规范: 生产环境必须使用 HTTPS)
  API_BASE_URL: 'https://pindouapi.lvky.cn/api',

  // # 2. 图片与静态资源访问基准地址 (HTTPS)
  IMAGE_BASE_URL: 'https://pindouapi.lvky.cn',

  // # 辅助函数: 自动解析补齐图片完整 URL
  formatImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wxfile://') || url.startsWith('data:image')) {
      return url;
    }
    // 相对路径补齐服务器域名
    return `${config.IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
};

module.exports = config;
