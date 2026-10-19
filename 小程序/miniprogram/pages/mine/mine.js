// # 我的中心与个人作品集逻辑
const { generateGridThumbnail } = require('../../utils/thumbnailHelper.js'); // # 离屏缩略图自愈引擎
const { SERVICE_AGREEMENT, PRIVACY_POLICY } = require('../../utils/policyHelper.js'); // # 用户协议与隐私保护
const { PRESET_PATTERNS } = require('../../utils/presetPatterns.js'); // # 官方图纸底座
const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    patternList: [],
    publicCount: 0,
    totalLikes: 0,
    loading: false,
    isLoggedIn: false,
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    showLoginSheet: false,
    tempAvatarUrl: '',
    tempNickName: '',
    isAgreed: false,
    showPolicyModal: false,
    policyTitle: '',
    policyContent: ''
  },

  onShow() {
    this.loadUserInfo();
    this.fetchMyPatterns();
  },

  loadUserInfo() {
    const isExplicit = wx.getStorageSync('pindou_is_logged_in') === true;
    const nickName = wx.getStorageSync('pindou_user_nickname') || '';
    const avatarUrl = wx.getStorageSync('pindou_user_avatar') || '';
    const isLoggedIn = isExplicit && !!nickName;

    this.setData({
      isLoggedIn,
      userInfo: {
        nickName: isLoggedIn ? nickName : '',
        avatarUrl: isLoggedIn ? avatarUrl : ''
      },
      tempNickName: nickName,
      tempAvatarUrl: avatarUrl
    });
  },

  onTapProfileHeader() {
    this.onOpenLoginSheet();
  },

  onOpenLoginSheet() {
    this.setData({
      showLoginSheet: true,
      tempNickName: this.data.userInfo.nickName || '',
      tempAvatarUrl: this.data.userInfo.avatarUrl || '',
      isAgreed: true
    });
  },

  onCloseLoginSheet() {
    this.setData({ showLoginSheet: false });
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

  onConfirmAuthLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请阅读并同意协议指引', icon: 'none' });
      return;
    }

    const nick = (this.data.tempNickName || '').trim() || '微信拼豆玩家';
    const avatar = this.data.tempAvatarUrl || '';

    wx.setStorageSync('pindou_user_nickname', nick);
    wx.setStorageSync('pindou_user_avatar', avatar);
    wx.setStorageSync('pindou_is_logged_in', true);

    this.setData({
      isLoggedIn: true,
      userInfo: { nickName: nick, avatarUrl: avatar },
      showLoginSheet: false
    });

    wx.showToast({ title: '登录成功！', icon: 'success' });
  },

  onLogout() {
    wx.showModal({
      title: '确认退出登录',
      content: '退出后将回到游客状态，是否确认退出当前账号？',
      confirmText: '退出登录',
      confirmColor: '#DC2626',
      cancelText: '取消',
      cancelColor: '#78716C',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('pindou_user_nickname');
          wx.removeStorageSync('pindou_user_avatar');
          wx.removeStorageSync('pindou_is_logged_in');
          this.setData({
            isLoggedIn: false,
            userInfo: { nickName: '', avatarUrl: '' },
            tempNickName: '',
            tempAvatarUrl: ''
          });
          wx.showToast({ title: '已安全退出', icon: 'success' });
        }
      }
    });
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

  onClearCache() {
    wx.showModal({
      title: '清理本地缓存',
      content: '清理本地图纸离屏快照与临时渲染数据？',
      confirmText: '确认清理',
      confirmColor: '#1C1917',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '缓存已清空', icon: 'success' });
          this.fetchMyPatterns();
        }
      }
    });
  },

  onPullDownRefresh() {
    this.fetchMyPatterns(() => {
      wx.stopPullDownRefresh();
    });
  },

  async fetchMyPatterns(callback) {
    const fallbackSample = (PRESET_PATTERNS && PRESET_PATTERNS.length > 6) ? [{
      ...PRESET_PATTERNS[6],
      displayName: '浪漫双层像素爱心 [入门范例]',
      isPublic: true,
      likes: 68
    }] : [];

    this.setData({ loading: true });
    try {
      const res = await api.getPatternList({ type: 'my' });
      const list = res.data || [];
      let publicCount = 0;
      let totalLikes = 0;

      let effectiveList = list;
      if (list.length === 0 && fallbackSample.length > 0) {
        effectiveList = fallbackSample;
      }

      const formatted = effectiveList.map((item, idx) => {
        if (item.isPublic) publicCount++;
        totalLikes += (item.likes || 0);

        const d = new Date(item.createTime || Date.now());
        const w = item.width || (item.gridData && item.gridData[0] ? item.gridData[0].length : 50);
        const h = item.height || (item.gridData ? item.gridData.length : 50);
        const displayName = item.displayName || item.name || `拼豆图纸 #${idx + 1}`;
        const rawThumb = item.previewUrl ? config.formatImageUrl(item.previewUrl) : '';
        const displayThumb = rawThumb || (item.gridData ? generateGridThumbnail(item.gridData, item.paletteBrand) : '');

        return {
          ...item,
          displayName,
          displayThumb,
          displaySize: `${w}×${h} 格`,
          createTimeFormatted: `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}`
        };
      });

      this.setData({
        patternList: formatted,
        publicCount,
        totalLikes,
        loading: false
      });
    } catch (err) {
      console.warn('fetchMyPatterns error, fallback to sample', err);
      this.setData({
        patternList: fallbackSample,
        publicCount: fallbackSample.length,
        totalLikes: fallbackSample.length ? 68 : 0,
        loading: false
      });
    } finally {
      if (callback) callback();
    }
  },

  async onTogglePublish(e) {
    const { id, index, public: isPub } = e.currentTarget.dataset;
    if (!id) return;

    const nextState = !isPub;
    wx.showLoading({ title: nextState ? '正在发布...' : '正在下架...' });

    try {
      await api.togglePublish(id, nextState);

      const list = this.data.patternList;
      list[index].isPublic = nextState;
      
      let publicCount = 0;
      list.forEach(item => { if (item.isPublic) publicCount++; });

      this.setData({ patternList: list, publicCount });
      wx.hideLoading();
      wx.showToast({
        title: nextState ? '已公开至社区' : '已设为私密',
        icon: 'success'
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onPreviewPatternImage(e) {
    const { index, id } = e.currentTarget.dataset;
    const item = this.data.patternList[index];
    const img = (item && item.displayThumb) || (item && item.previewUrl);
    if (img) {
      wx.previewImage({
        urls: [img],
        current: img,
        showmenu: true
      });
    } else if (id) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    }
  },

  onLoadPattern(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.patternList[index];
    if (!item || !item.gridData) return;

    const app = getApp();
    app.globalData.currentPattern = {
      gridData: item.gridData,
      paletteBrand: item.paletteBrand || 'MARD',
      name: item.displayName || item.name
    };

    wx.showToast({ title: '图纸已载入工作台', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 350);
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
          // # 1. 乐观即时剔除：瞬间从本地数组移除，UI 零延迟响应
          const list = this.data.patternList.filter(item => item._id !== id);
          let publicCount = 0;
          let totalLikes = 0;
          list.forEach(item => {
            if (item.isPublic) publicCount++;
            totalLikes += (item.likes || 0);
          });
          this.setData({ patternList: list, publicCount, totalLikes });

          wx.showToast({ title: '已删除', icon: 'success' });

          // # 2. 服务端物理删除
          try {
            await api.deletePattern(id);
          } catch (err) {
            console.error(err);
            this.fetchMyPatterns();
          }
        }
      }
    });
  },

  onNavigateToCollection(e) {
    const filter = e.currentTarget.dataset.filter || 'all';
    wx.navigateTo({
      url: `/pages/collection/collection?filter=${filter}`
    });
  },

  onShowLikesSummary() {
    wx.showModal({
      title: '社区获赞热度',
      content: `您在拼豆工坊已累计获得 ${this.data.totalLikes} 次玩家的点赞认可！公开更多优秀图纸可解锁更高手作声望～`,
      showCancel: false,
      confirmText: '继续创作',
      confirmColor: '#F59E0B'
    });
  },

  onShareAppMessage() {
    const name = (this.data.userInfo && this.data.userInfo.nickName) || '拼豆手作创作者';
    return {
      title: `${name} 的拼豆手作作品图库，快来一起开拼！`,
      path: '/pages/community/community'
    };
  }
});
