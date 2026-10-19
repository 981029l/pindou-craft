// # 自建后端独立 API 客户端请求层 (彻底替代 wx.cloud)
const config = require('../config.js');

const TOKEN_KEY = 'pindou_api_token';
const OPENID_KEY = 'pindou_api_openid';

const api = {
  // # 1. 本地凭证读写
  getToken() {
    return wx.getStorageSync(TOKEN_KEY) || '';
  },

  setToken(token) {
    wx.setStorageSync(TOKEN_KEY, token);
  },

  getOpenid() {
    return wx.getStorageSync(OPENID_KEY) || '';
  },

  setOpenid(openid) {
    wx.setStorageSync(OPENID_KEY, openid);
  },

  clearAuth() {
    wx.removeStorageSync(TOKEN_KEY);
    wx.removeStorageSync(OPENID_KEY);
  },

  // # 2. 核心网络请求封装 (自动携带 Token)
  request({ url, method = 'GET', data = {}, needAuth = false }) {
    return new Promise(async (resolve, reject) => {
      let token = api.getToken();

      // # 如果需要鉴权但无 Token，自动静默登录一次
      if (needAuth && !token) {
        try {
          await api.login();
          token = api.getToken();
        } catch (e) {
          console.warn('[API] 静默鉴权登录未就绪', e);
        }
      }

      const headers = {
        'content-type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestUrl = url.startsWith('http') ? url : `${config.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

      wx.request({
        url: requestUrl,
        method,
        data,
        header: headers,
        timeout: 15000,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // # Token 失效处理
            api.clearAuth();
            reject({ success: false, code: 401, message: res.data?.message || '登录凭证已失效' });
          } else {
            reject({
              success: false,
              code: res.statusCode,
              message: res.data?.message || '请求处理失败'
            });
          }
        },
        fail: (err) => {
          console.error('[API Request Error]', requestUrl, err);
          reject({
            success: false,
            message: err.errMsg && err.errMsg.includes('fail') ? '网络连接异常，请检查服务器网络或合法域名配置' : '网络请求失败'
          });
        }
      });
    });
  },

  // # 3. 微信小程序快捷登录 (code 换 token)
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (loginRes) => {
          if (!loginRes.code) {
            return reject(new Error('未获取到微信登录 code'));
          }

          const cachedNick = wx.getStorageSync('pindou_user_nickname') || '拼豆创作者';
          const cachedAvatar = wx.getStorageSync('pindou_user_avatar') || '';

          try {
            const res = await api.request({
              url: '/auth/login',
              method: 'POST',
              data: {
                code: loginRes.code,
                nickname: cachedNick,
                avatar: cachedAvatar
              }
            });

            if (res.success && res.token) {
              api.setToken(res.token);
              if (res.openid) api.setOpenid(res.openid);
              resolve(res);
            } else {
              reject(new Error(res.message || '登录失败'));
            }
          } catch (e) {
            reject(e);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // # 4. 图片文件上传 (替代 wx.cloud.uploadFile)
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const token = api.getToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      wx.uploadFile({
        url: `${config.API_BASE_URL}/upload`,
        filePath,
        name: 'file',
        header: headers,
        timeout: 30000,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              // 统一补齐前缀完整访问地址
              const fullUrl = config.formatImageUrl(data.url);
              resolve({
                success: true,
                url: data.url,
                fullUrl,
                fileID: data.url
              });
            } else {
              reject(new Error(data.message || '上传文件被拒绝'));
            }
          } catch (e) {
            reject(new Error('上传响应解析失败'));
          }
        },
        fail: (err) => {
          console.error('[API Upload Error]', err);
          reject(new Error('上传失败，请检查网络或文件大小'));
        }
      });
    });
  },

  // # 5. 业务接口封装 (与原有云函数语义 1:1 对齐)
  savePattern(data) {
    return api.request({
      url: '/patterns',
      method: 'POST',
      data,
      needAuth: true
    });
  },

  getPatternList({ type = 'my', sortBy = 'createTime', limit = 60 }) {
    return api.request({
      url: `/patterns?type=${type}&sortBy=${sortBy}&limit=${limit}`,
      method: 'GET',
      needAuth: type === 'my'
    });
  },

  getPatternDetail(id) {
    return api.request({
      url: `/patterns/${id}`,
      method: 'GET'
    });
  },

  deletePattern(id) {
    return api.request({
      url: `/patterns/${id}`,
      method: 'DELETE',
      needAuth: true
    });
  },

  togglePublish(id, isPublic) {
    return api.request({
      url: `/patterns/${id}/publish`,
      method: 'PUT',
      data: { isPublic },
      needAuth: true
    });
  },

  likePattern(id) {
    return api.request({
      url: `/patterns/${id}/like`,
      method: 'POST'
    });
  },

  recordDownload(id) {
    return api.request({
      url: `/patterns/${id}/download`,
      method: 'POST'
    });
  },

  addComment(patternId, { content, authorName, authorAvatar }) {
    return api.request({
      url: `/patterns/${patternId}/comment`,
      method: 'POST',
      data: { content, authorName, authorAvatar },
      needAuth: true
    });
  }
};

module.exports = api;
