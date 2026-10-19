// # 拼豆工坊自建后端环境配置文件
const config = {
  // # 1. 独立后端 API 基础请求路径 (本地调试填服务器IP或127.0.0.1，上线后填备案的 HTTPS 域名)
  API_BASE_URL: 'http://127.0.0.1:3001/api',

  // # 2. 图片与静态资源访问基准地址
  IMAGE_BASE_URL: 'http://127.0.0.1:3001',

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
