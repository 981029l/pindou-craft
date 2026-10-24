// # 图纸作品详情与评论互动逻辑
const { getPaletteDataByBrand } = require('../../utils/paletteManager.js'); // # 统一色库模块中心
const { SERVICE_AGREEMENT, PRIVACY_POLICY } = require('../../utils/policyHelper.js'); // # 用户协议与隐私保护
const { PRESET_MAP, PRESET_PATTERNS } = require('../../utils/presetPatterns.js'); // # 官方精选图纸底座
const { generateGridThumbnail } = require('../../utils/thumbnailHelper.js'); // # 离屏缩略图引擎
const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    patternId: '',
    pattern: {},
    commentsList: [],
    commentText: '',
    isLiked: false,
    loading: true,
    showWechatLoginSheet: false,
    tempAvatarUrl: '',
    tempNickName: '',
    isAgreed: true,
    showPolicyModal: false,
    policyTitle: '',
    policyContent: ''
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.setData({ patternId: id });
      this.fetchDetail(id);
    }
  },

  onPullDownRefresh() {
    if (this.data.patternId) {
      this.fetchDetail(this.data.patternId, () => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  // # 载入官方精选图纸
  loadPresetDetail(p, callback) {
    const d = new Date(p.createTime || Date.now());
    const w = p.width || 16;
    const h = p.height || 16;
    const previewUrl = p.previewUrl || (p.gridData ? generateGridThumbnail(p.gridData, p.paletteBrand) : '');
    const isLiked = wx.getStorageSync(`pindou_liked_${p._id}`) === true;

    const formattedPattern = {
      ...p,
      width: w,
      height: h,
      name: p.name || '拼豆手作图纸',
      authorName: p.authorName || 'PinDou 官方工坊',
      isPublic: true,
      previewUrl,
      createTimeFormatted: `${d.getMonth() + 1}月${d.getDate()}日`
    };

    const commentsList = (p.comments || []).map(c => {
      const cd = new Date(c.createTime || Date.now());
      return {
        ...c,
        timeFormatted: `${cd.getMonth() + 1}/${cd.getDate()} ${cd.getHours()}:${cd.getMinutes() < 10 ? '0' : ''}${cd.getMinutes()}`
      };
    });

    this.setData({
      pattern: formattedPattern,
      commentsList,
      isLiked,
      loading: false
    });

    if (!previewUrl && p.gridData) {
      setTimeout(() => {
        this.renderFallbackCanvas(p.gridData, p.paletteBrand || 'MARD');
      }, 50);
    }

    if (callback) callback();
  },

  async fetchDetail(id, callback) {
    // # 1. 优先检查是否为官方精选图纸
    if (PRESET_MAP.has(id)) {
      this.loadPresetDetail(PRESET_MAP.get(id), callback);
      return;
    }

    if (!wx.cloud) {
      // # 无云开发环境兜底展示首张精选图纸
      if (PRESET_PATTERNS.length > 0) {
        this.loadPresetDetail(PRESET_PATTERNS[0], callback);
      } else {
        if (callback) callback();
      }
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await api.getPatternDetail(id);
      const p = res.data || null;
      if (!p) {
        // # 服务端未查到，兜底从精选图库取出对应题材图纸展示
        const fallbackPattern = PRESET_PATTERNS[0];
        this.loadPresetDetail(fallbackPattern, callback);
        return;
      }

      const d = new Date(p.createTime || Date.now());
      const w = p.width || (p.gridData && p.gridData[0] ? p.gridData[0].length : 50);
      const h = p.height || (p.gridData ? p.gridData.length : 50);

      const formattedPattern = {
        ...p,
        width: w,
        height: h,
        name: p.name || '拼豆手作图纸',
        authorName: p.authorName || '拼豆创作者',
        previewUrl: p.previewUrl ? config.formatImageUrl(p.previewUrl) : '',
        createTimeFormatted: `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}`
      };

      const rawComments = p.comments || [];
      const commentsList = rawComments.map(c => {
        const cd = new Date(c.createTime || Date.now());
        return {
          ...c,
          timeFormatted: `${cd.getMonth() + 1}/${cd.getDate()} ${cd.getHours()}:${cd.getMinutes() < 10 ? '0' : ''}${cd.getMinutes()}`
        };
      }).reverse();

      this.setData({
        pattern: formattedPattern,
        commentsList,
        loading: false
      });

      // # 若无图片链接，使用 Canvas 兜底绘制微缩插板
      if (!p.previewUrl && p.gridData) {
        this.renderFallbackCanvas(p.gridData, p.paletteBrand || 'MARD');
      }
    } catch (err) {
      console.warn('fetchDetail cloud error, fallback to preset', err);
      if (PRESET_PATTERNS.length > 0) {
        this.loadPresetDetail(PRESET_PATTERNS[0], callback);
      } else {
        this.setData({ loading: false });
      }
    } finally {
      if (callback) callback();
    }
  },

  renderFallbackCanvas(gridData, brand) {
    const query = this.createSelectorQuery();
    query.select('#detailPreviewCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const canvas = res[0].node;
        this.previewCanvas = canvas; // # 保存画布实例用于随时导出
        const ctx = canvas.getContext('2d');
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2) || 2;

        const w = res[0].width;
        const h = res[0].height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const gridH = gridData.length;
        const gridW = gridData[0].length;
        const padding = 36; // # 四周充裕留白，避免边缘切断
        const cellSize = Math.min((w - padding * 2) / gridW, (h - padding * 2) / gridH);
        const boardW = gridW * cellSize;
        const boardH = gridH * cellSize;
        const panX = (w - boardW) / 2;
        const panY = (h - boardH) / 2;

        const { map } = getPaletteDataByBrand(brand);

        ctx.save();
        ctx.translate(panX, panY);
        ctx.fillStyle = '#FAF8F5';
        ctx.fillRect(0, 0, boardW, boardH);

        for (let y = 0; y < gridH; y++) {
          for (let x = 0; x < gridW; x++) {
            const code = gridData[y][x];
            if (!code || code === 'EMPTY') continue;
            const item = map.get(code);
            const hex = item ? item.hex : '#1C1917';
            ctx.fillStyle = hex;
            ctx.beginPath();
            ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize * 0.44, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });
  },

  async getLocalTempFilePath() {
    const p = this.data.pattern;
    // # 1. 若已有云端 previewUrl，下载为本地临时文件
    if (p.previewUrl) {
      if (p.previewUrl.startsWith('cloud://')) {
        try {
          const res = await wx.cloud.downloadFile({ fileID: p.previewUrl });
          return res.tempFilePath;
        } catch (e) {
          console.error('Download cloud file failed', e);
        }
      } else if (p.previewUrl.startsWith('http://') || p.previewUrl.startsWith('https://')) {
        try {
          const res = await new Promise((resolve, reject) => {
            wx.downloadFile({
              url: p.previewUrl,
              success: resolve,
              fail: reject
            });
          });
          return res.tempFilePath;
        } catch (e) {
          console.error('Download http file failed', e);
        }
      } else {
        return p.previewUrl;
      }
    }

    // # 2. 若无 previewUrl，通过本地 Canvas 导出原图
    if (this.previewCanvas) {
      return new Promise((resolve) => {
        wx.canvasToTempFilePath({
          canvas: this.previewCanvas,
          fileType: 'png',
          quality: 1.0,
          success: (res) => resolve(res.tempFilePath),
          fail: () => resolve('')
        });
      });
    }

    return '';
  },

  async onPreviewFullImage() {
    wx.showLoading({ title: '加载原图中...' });
    const imgUrl = await this.getLocalTempFilePath();
    wx.hideLoading();

    if (!imgUrl) {
      wx.showToast({ title: '图片加载中，请稍后', icon: 'none' });
      return;
    }

    wx.previewImage({
      urls: [imgUrl],
      current: imgUrl,
      showmenu: true
    });
  },

  async onSaveToAlbum() {
    wx.showLoading({ title: '正在导出图片...' });
    const localPath = await this.getLocalTempFilePath();
    wx.hideLoading();

    if (!localPath) {
      wx.showToast({ title: '获取图片失败', icon: 'none' });
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: localPath,
      success: () => {
        wx.showToast({ title: '已保存至手机相册！', icon: 'success' });
      },
      fail: (err) => {
        if (err.errMsg && (err.errMsg.includes('auth') || err.errMsg.includes('deny'))) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在微信设置中允许拼豆工坊保存图片到系统相册',
            confirmText: '去设置',
            success: (mRes) => {
              if (mRes.confirm) wx.openSetting();
            }
          });
        } else {
          wx.showToast({ title: '已取消保存', icon: 'none' });
        }
      }
    });
  },

  // # 一键载入工作台二次创作 / 立即开拼
  onLoadToWorkbench() {
    const p = this.data.pattern;
    if (!p || !p.gridData || p.gridData.length === 0) {
      wx.showToast({ title: '图纸数据加载中...', icon: 'none' });
      return;
    }

    const remixData = {
      name: p.name ? `${p.name} (二创)` : '社区二创图纸',
      gridData: p.gridData,
      paletteBrand: p.paletteBrand || 'MARD',
      width: p.width || p.gridData[0].length,
      height: p.height || p.gridData.length
    };

    try {
      wx.setStorageSync('PINDOU_REMIX_PATTERN', remixData);
    } catch (e) {}

    const app = getApp();
    if (app && app.globalData) {
      app.globalData.currentPattern = remixData;
    }

    wx.switchTab({
      url: '/pages/index/index',
      success: () => {
        wx.showToast({ title: '已载入工作台', icon: 'success' });
      }
    });
  },

  checkUserLogin(actionName, callback) {
    const cachedName = wx.getStorageSync('pindou_user_nickname');
    if (cachedName) {
      callback({
        nickname: cachedName,
        avatarUrl: wx.getStorageSync('pindou_user_avatar') || ''
      });
      return;
    }

    this.pendingAuthAction = callback;
    this.setData({ 
      showWechatLoginSheet: true,
      tempNickName: wx.getStorageSync('pindou_user_nickname') || '',
      tempAvatarUrl: wx.getStorageSync('pindou_user_avatar') || '',
      isAgreed: true
    });
  },

  onCloseWechatLogin() {
    this.setData({ showWechatLoginSheet: false });
    this.pendingAuthAction = null;
  },

  onChooseAvatar(e) {
    if (this.isAvatarPicking) return;
    this.isAvatarPicking = true;
    setTimeout(() => { this.isAvatarPicking = false; }, 800);

    const { avatarUrl } = e.detail;
    if (avatarUrl) {
      this.setData({ tempAvatarUrl: avatarUrl });
    }
  },

  onNicknameInput(e) {
    this.setData({ tempNickName: e.detail.value });
  },

  onNicknameBlur(e) {
    this.setData({ tempNickName: e.detail.value });
  },

  onNicknameChange(e) {
    this.setData({ tempNickName: e.detail.value });
  },

  onSelectQuickNick(e) {
    const nick = e.currentTarget.dataset.nick;
    if (nick) {
      this.setData({ tempNickName: nick });
    }
  },

  onToggleAgreement() {
    this.setData({ isAgreed: !this.data.isAgreed });
  },

  onOpenPolicy(e) {
    const type = e.currentTarget.dataset.type;
    const isPrivacy = type === 'privacy';
    this.setData({
      showPolicyModal: true,
      policyTitle: isPrivacy ? 'PinDou 拼豆工坊 隐私保护指引' : 'PinDou 拼豆工坊 用户服务协议',
      policyContent: isPrivacy ? PRIVACY_POLICY : SERVICE_AGREEMENT
    });
  },

  onClosePolicyModal() {
    this.setData({ showPolicyModal: false });
  },

  onConfirmAuthLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请阅读并同意协议指引', icon: 'none' });
      return;
    }

    const nickname = (this.data.tempNickName || '').trim() || '微信创作者';
    const avatarUrl = this.data.tempAvatarUrl || '';

    wx.setStorageSync('pindou_user_nickname', nickname);
    wx.setStorageSync('pindou_user_avatar', avatarUrl);
    wx.setStorageSync('pindou_is_logged_in', true);

    this.setData({ showWechatLoginSheet: false });
    wx.showToast({ title: '微信登录成功', icon: 'success' });

    if (typeof this.pendingAuthAction === 'function') {
      this.pendingAuthAction({ nickname, avatarUrl });
      this.pendingAuthAction = null;
    }
  },

  async onToggleLike() {
    this.checkUserLogin('点赞', async (userInfo) => {
      const p = this.data.pattern;
      if (this.data.isLiked) {
        wx.showToast({ title: '已点赞过了～', icon: 'none' });
        return;
      }
      const nextLikes = (p.likes || 0) + 1;
      this.setData({
        isLiked: true,
        'pattern.likes': nextLikes
      });

      wx.setStorageSync(`pindou_liked_${this.data.patternId}`, true);
      wx.showToast({ title: '点赞成功！', icon: 'success' });

      if (!this.data.patternId.startsWith('preset_')) {
        api.likePattern(this.data.patternId).catch(err => console.error(err));
      }
    });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  async onSubmitComment() {
    const content = this.data.commentText.trim();
    if (!content) return;

    this.checkUserLogin('评论', async (userInfo) => {
      wx.showLoading({ title: '正在发表...' });

      try {
        const res = await api.addComment(this.data.patternId, {
          content,
          authorName: userInfo.nickname,
          authorAvatar: userInfo.avatarUrl
        });

        wx.hideLoading();
        if (res.success) {
          wx.showToast({ title: '评论成功！', icon: 'success' });
          this.setData({ commentText: '' });
          this.fetchDetail(this.data.patternId);
        } else {
          wx.showToast({ title: res.message || '发表失败', icon: 'none' });
        }
      } catch (err) {
        wx.hideLoading();
        wx.showToast({ title: err.message || '网络异常', icon: 'none' });
      }
    });
  },

  async onLoadToWorkbench() {
    const p = this.data.pattern;
    if (!p.gridData) return;

    const app = getApp();
    app.globalData.currentPattern = {
      gridData: p.gridData,
      paletteBrand: p.paletteBrand || 'MARD',
      name: p.name
    };

    // # 记录开拼下载量自增
    if (!this.data.patternId.startsWith('preset_')) {
      api.recordDownload(this.data.patternId).catch(() => {});
    }

    wx.showToast({ title: '已载入工作台！', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 350);
  },

  preventBubble() {}
});
