// # 拼豆工坊小程序首页逻辑
const { processImageToGrid } = require('../../utils/imageProcessor.js');

Page({
  data: {
    activeTab: 'control', // # control | canvas
    currentImageSrc: '',
    gridWidth: 50,
    gridHeight: 50,
    selectedBaseSize: 50,
    paletteBrand: 'MARD',
    brandOptions: ['MARD (221色)', 'PERLER (80色)', 'ARTKAL (160色)'],
    brandIndex: 0,
    gridData: [],
    selectedColorCode: 'M01',
    highlightColorCode: '',
    showQuickPalette: false,
    removeBackground: false,
    isGenerating: false,
    isSavingCloud: false,
    showSaveModal: false,
    saveTempPreviewUrl: '',
    patternNameInput: '',
    isPublishCommunity: false,
    showSplash: false,
    splashHiding: false,
  },

  onLoad() {
    this.initDefaultGrid(50, 50); // # 初始化基础插板规格

    // # 首次冷启动高定开屏动画 (1.2s 自动沉浸揭幕)
    const app = getApp();
    if (app && app.globalData && !app.globalData.hasShownSplash) {
      app.globalData.hasShownSplash = true;
      this.setData({ showSplash: true, splashHiding: false });
      this.splashTimer = setTimeout(() => {
        this.setData({ splashHiding: true });
        setTimeout(() => {
          this.setData({ showSplash: false });
        }, 450);
      }, 1200);
    }
  },

  onDismissSplash() {
    if (this.splashTimer) clearTimeout(this.splashTimer);
    this.setData({ splashHiding: true });
    setTimeout(() => {
      this.setData({ showSplash: false });
    }, 300);
  },

  preventBubble() {}, // # 阻断触摸穿透事件冒泡

  onReady() {
    this.initOffscreenCanvas(); // # DOM 挂载完成后安全初始化离屏 Canvas
  },

  onShow() {
    // # 检查全局是否有从作品集或社区二创回载的图纸
    const app = getApp();
    let targetPattern = app.globalData.currentPattern;
    if (!targetPattern) {
      try {
        const cachedRemix = wx.getStorageSync('PINDOU_REMIX_PATTERN');
        if (cachedRemix) {
          targetPattern = cachedRemix;
          wx.removeStorageSync('PINDOU_REMIX_PATTERN');
        }
      } catch (e) {}
    }

    if (targetPattern) {
      const p = targetPattern;
      const w = p.gridData && p.gridData[0] ? p.gridData[0].length : (p.width || 50);
      const h = p.gridData ? p.gridData.length : (p.height || 50);
      this.rawGridBeforeRemoveBg = p.gridData.map(r => r.slice());
      this.setData({
        gridData: p.gridData,
        gridWidth: w,
        gridHeight: h,
        paletteBrand: p.paletteBrand || 'MARD',
        patternNameInput: p.name ? `${p.name} (二创)` : '',
        activeTab: 'canvas'
      }, () => {
        this.refreshEditorCanvas();
        wx.showToast({ title: '已载入二创图纸', icon: 'success' });
      });
      app.globalData.currentPattern = null;
    }
  },

  onHide() {
    if (this.data.showSaveModal) {
      this.setData({ showSaveModal: false });
      if (wx.showTabBar) {
        try { wx.showTabBar({ animation: false }); } catch (e) {}
      }
    }
  },

  initOffscreenCanvas() {
    const query = this.createSelectorQuery();
    query.select('#offscreenCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0] && res[0].node) {
          this.offscreenCanvas = res[0].node;
        }
      });
  },

  initDefaultGrid(w = 50, h = 50) {
    const grid = Array.from({ length: h }, () => Array(w).fill('EMPTY'));
    this.setData({ gridData: grid, gridWidth: w, gridHeight: h });
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab }, () => {
      if (tab === 'canvas') {
        this.refreshEditorCanvas();
      }
    });
  },

  refreshEditorCanvas() {
    setTimeout(() => {
      const editor = this.selectComponent('#editor');
      if (editor) {
        editor.initCanvas();
      }
    }, 50);
  },

  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        this.setData({ currentImageSrc: tempPath });
        this.generateFromImage(tempPath);
      }
    });
  },

  onSelectSize(e) {
    const size = parseInt(e.currentTarget.dataset.size);
    if (this.data.selectedBaseSize === size) return;
    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}
    this.setData({ selectedBaseSize: size });
    if (this.data.currentImageSrc) {
      this.generateFromImage(this.data.currentImageSrc);
    } else {
      this.setData({ gridWidth: size, gridHeight: size });
      this.initDefaultGrid(size, size);
    }
  },

  onBrandChange(e) {
    const brands = ['MARD', 'PERLER', 'ARTKAL'];
    const idx = e.detail.value;
    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}
    this.setData({
      brandIndex: idx,
      paletteBrand: brands[idx]
    });
    if (this.data.currentImageSrc) {
      this.generateFromImage(this.data.currentImageSrc);
    }
  },

  onToggleRemoveBg() {
    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}
    const next = !this.data.removeBackground;
    this.setData({ removeBackground: next });
    if (!this.data.gridData || this.data.gridData.length === 0) return;

    if (next) {
      if (!this.rawGridBeforeRemoveBg) {
        this.rawGridBeforeRemoveBg = this.data.gridData.map(row => row.slice());
      }
      const cleaned = this.floodFillRemoveBackground(this.data.gridData);
      this.setData({ gridData: cleaned }, () => {
        this.refreshEditorCanvas();
        wx.showToast({ title: '已剔除外围纯色背景', icon: 'success' });
      });
    } else {
      if (this.rawGridBeforeRemoveBg) {
        this.setData({ gridData: this.rawGridBeforeRemoveBg.map(row => row.slice()) }, () => {
          this.refreshEditorCanvas();
          wx.showToast({ title: '已恢复背景', icon: 'none' });
        });
      }
    }
  },

  // # 四角连通域边缘泛洪去底算法 (保护角色内部同色区域)
  floodFillRemoveBackground(grid) {
    if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0) return grid;
    const H = grid.length;
    const W = grid[0].length;
    const newGrid = grid.map(row => row.slice());

    // # 1. 采样四角颜色，取频次最高者作为基准背景色
    const cornerColors = [newGrid[0][0], newGrid[0][W - 1], newGrid[H - 1][0], newGrid[H - 1][W - 1]].filter(c => c && c !== 'EMPTY');
    if (cornerColors.length === 0) return newGrid;

    const countMap = {};
    cornerColors.forEach(c => { countMap[c] = (countMap[c] || 0) + 1; });
    let bgCode = cornerColors[0];
    let maxCount = 0;
    for (const c in countMap) {
      if (countMap[c] > maxCount) {
        maxCount = countMap[c];
        bgCode = c;
      }
    }

    // # 2. 收集四周边界与背景色相同的起点
    const visited = Array.from({ length: H }, () => new Uint8Array(W));
    const queue = [];

    const pushSeed = (y, x) => {
      if (newGrid[y][x] === bgCode && !visited[y][x]) {
        visited[y][x] = 1;
        queue.push([y, x]);
      }
    };

    for (let x = 0; x < W; x++) {
      pushSeed(0, x);
      pushSeed(H - 1, x);
    }
    for (let y = 0; y < H; y++) {
      pushSeed(y, 0);
      pushSeed(y, W - 1);
    }

    // # 3. BFS 连通域泛洪将外围背景置为空
    let head = 0;
    const dy = [-1, 1, 0, 0];
    const dx = [0, 0, -1, 1];

    while (head < queue.length) {
      const [cy, cx] = queue[head++];
      newGrid[cy][cx] = 'EMPTY';

      for (let i = 0; i < 4; i++) {
        const ny = cy + dy[i];
        const nx = cx + dx[i];
        if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
          if (!visited[ny][nx] && newGrid[ny][nx] === bgCode) {
            visited[ny][nx] = 1;
            queue.push([ny, nx]);
          }
        }
      }
    }

    return newGrid;
  },

  async generateFromImage(imagePath) {
    if (!this.offscreenCanvas) {
      wx.showToast({ title: '画布准备中，请重试', icon: 'none' });
      return;
    }

    this.setData({ isGenerating: true });
    wx.showLoading({ title: '正在量化拼豆图纸...' });

    try {
      const baseDim = this.data.selectedBaseSize || this.data.gridWidth || 50;
      const grid = await processImageToGrid({
        canvas: this.offscreenCanvas,
        imagePath,
        maxDimension: baseDim,
        targetWidth: baseDim,
        targetHeight: baseDim,
        paletteBrand: this.data.paletteBrand
      });

      const newH = grid.length;
      const newW = grid[0] ? grid[0].length : newH;

      this.rawGridBeforeRemoveBg = grid.map(row => row.slice());
      let finalGrid = grid;
      if (this.data.removeBackground) {
        finalGrid = this.floodFillRemoveBackground(grid);
      }

      this.setData({
        gridData: finalGrid,
        gridWidth: newW,
        gridHeight: newH,
        isGenerating: false
      }, () => {
        this.refreshEditorCanvas();
        // # 生成完成后平滑引导视口过渡至画布工作台
        try {
          wx.pageScrollTo({
            selector: '.canvas-card',
            duration: 400
          });
        } catch (e) {}
      });
      wx.hideLoading();
      wx.showToast({ title: '图纸生成成功！', icon: 'success' });
    } catch (err) {
      console.error(err);
      this.setData({ isGenerating: false });
      wx.hideLoading();
      wx.showToast({ title: '图像处理失败', icon: 'none' });
    }
  },

  onGeneratePattern() {
    if (!this.data.currentImageSrc) {
      this.onChooseImage();
    } else {
      this.generateFromImage(this.data.currentImageSrc);
    }
  },

  async onSaveToCloud() {
    if (!this.data.gridData || this.data.gridData.length === 0) {
      wx.showToast({ title: '画布为空，无法保存', icon: 'none' });
      return;
    }

    const now = new Date();
    const defaultName = `拼豆手作_${now.getMonth() + 1}月${now.getDate()}日_${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    // # 1. 隐藏底部原生 Tab 栏，深黑遮罩全屏沉浸
    try {
      if (wx.hideTabBar) {
        wx.hideTabBar({ animation: true });
      }
    } catch (e) {}

    // # 2. 立即打开居中手作凭证弹窗，重置保存状态
    this.setData({
      showSaveModal: true,
      saveTempPreviewUrl: '',
      patternNameInput: defaultName,
      isPublishCommunity: false,
      isSavingCloud: false
    });

    // # 3. 毫秒级导出当前画布效果图展示在凭证卡内
    const editor = this.selectComponent('#editor') || this.selectComponent('#canvasEditor');
    if (editor && typeof editor.exportPreviewTempFilePath === 'function') {
      try {
        const tempPath = await editor.exportPreviewTempFilePath();
        if (tempPath) {
          this.setData({ saveTempPreviewUrl: tempPath });
        }
      } catch (e) {
        console.warn('Preview export error', e);
      }
    }
  },

  onCloseSaveModal() {
    this.setData({ showSaveModal: false, isSavingCloud: false });
    // # 恢复底部原生 Tab 栏
    try {
      if (wx.showTabBar) {
        wx.showTabBar({ animation: true });
      }
    } catch (e) {}
  },

  onPatternNameInput(e) {
    this.setData({ patternNameInput: e.detail.value });
  },

  onClearPatternName() {
    this.setData({ patternNameInput: '' });
  },

  onSwitchPublishCommunity(e) {
    this.setData({ isPublishCommunity: e.detail.value });
  },

  preventBubble() {},

  async onConfirmSaveToCloud() {
    if (this.data.isSavingCloud) return;

    if (!wx.cloud) {
      wx.showToast({ title: '请配置微信云开发环境', icon: 'none' });
      return;
    }

    const name = (this.data.patternNameInput || '').trim() || '未命名拼豆手作';

    this.setData({ isSavingCloud: true });
    wx.showLoading({ title: '正在存入云端作品集...' });

    let previewUrl = '';
    let tempPath = this.data.saveTempPreviewUrl;
    if (!tempPath) {
      const editor = this.selectComponent('#editor') || this.selectComponent('#canvasEditor');
      if (editor && typeof editor.exportPreviewTempFilePath === 'function') {
        try {
          tempPath = await editor.exportPreviewTempFilePath();
        } catch (e) {
          console.warn('Fallback preview export error', e);
        }
      }
    }

    if (tempPath) {
      try {
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `patterns_preview/pattern_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.png`,
          filePath: tempPath
        });
        previewUrl = uploadRes.fileID || '';
      } catch (uploadErr) {
        console.warn('Preview upload skipped', uploadErr);
      }
    }

    const cachedAuthorName = wx.getStorageSync('pindou_user_nickname') || '拼豆创作者';
    const cachedAuthorAvatar = wx.getStorageSync('pindou_user_avatar') || '';

    try {
      const res = await wx.cloud.callFunction({
        name: 'savePattern',
        data: {
          name,
          gridData: this.data.gridData,
          paletteBrand: this.data.paletteBrand,
          width: this.data.gridWidth,
          height: this.data.gridHeight,
          previewUrl,
          isPublic: this.data.isPublishCommunity,
          authorName: cachedAuthorName,
          authorAvatar: cachedAuthorAvatar
        }
      });

      this.setData({
        isSavingCloud: false,
        showSaveModal: false
      });
      wx.hideLoading();

      // # 恢复底部原生 Tab 栏
      try {
        if (wx.showTabBar) {
          wx.showTabBar({ animation: true });
        }
      } catch (e) {}

      wx.showModal({
        title: '保存成功',
        content: `《${name}》已存入云端！是否前往【我的作品集】查看？`,
        confirmText: '查看作品',
        confirmColor: '#F59E0B',
        cancelText: '留在工坊',
        cancelColor: '#78716C',
        success: (modalRes) => {
          if (modalRes.confirm) {
            wx.navigateTo({ url: '/pages/collection/collection' });
          }
        }
      });
    } catch (err) {
      console.error(err);
      this.setData({ isSavingCloud: false });
      wx.hideLoading();
      try {
        if (wx.showTabBar) {
          wx.showTabBar({ animation: true });
        }
      } catch (e) {}
      wx.showToast({ title: '保存失败，请检查云函数', icon: 'none' });
    }
  },

  onGoToExport() {
    const app = getApp();
    app.globalData.exportData = {
      gridData: this.data.gridData,
      paletteBrand: this.data.paletteBrand
    };
    wx.navigateTo({ url: '/pages/export/export' });
  },

  onColorSelected(e) {
    this.setData({ selectedColorCode: e.detail.code });
  },

  onGridChanged(e) {
    this.setData({ gridData: e.detail.gridData });
  },

  onToggleHighlight(e) {
    const code = e.detail.code;
    this.setData({
      highlightColorCode: this.data.highlightColorCode === code ? '' : code
    });
  },

  onOpenPalette() {
    this.setData({ showQuickPalette: true });
  },

  onClosePalette() {
    this.setData({ showQuickPalette: false });
  }
});
