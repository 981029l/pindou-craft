// # A4 高清图纸与 BOM 导出逻辑
const { generateBomCsv } = require('../../utils/exportHelper.js');
const { getPaletteDataByBrand } = require('../../utils/paletteManager.js');

function getContrastTextColor(hex = '#000000') {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1C1917' : '#FFFFFF';
}

Page({
  data: {
    gridData: [],
    gridWidth: 0,
    gridHeight: 0,
    paletteBrand: 'MARD',
    bomData: { list: [], total: 0, text: '' },
    isSavingImage: false
  },

  onLoad() {
    const app = getApp();
    const exp = app.globalData.exportData;
    if (!exp || !exp.gridData || exp.gridData.length === 0) {
      wx.navigateBack();
      return;
    }

    const bom = generateBomCsv(exp.gridData, exp.paletteBrand);
    this.setData({
      gridData: exp.gridData,
      gridWidth: exp.gridData[0].length,
      gridHeight: exp.gridData.length,
      paletteBrand: exp.paletteBrand || 'MARD',
      bomData: bom
    }, () => {
      this.initExportCanvas();
    });
  },

  initExportCanvas() {
    const query = this.createSelectorQuery();
    query.select('#exportCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2) || 2;

        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        this.canvas = canvas;
        this.ctx = ctx;
        this.viewWidth = res[0].width;
        this.viewHeight = res[0].height;

        this.renderA4Preview();
      });
  },

  renderA4Preview() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const grid = this.data.gridData;
    const height = grid.length;
    const width = grid[0].length;
    const brand = this.data.paletteBrand;
    const { map } = getPaletteDataByBrand(brand);

    const padding = 20;
    const maxDrawW = this.viewWidth - padding * 2;
    const maxDrawH = this.viewHeight - padding * 2;
    const cellSize = Math.min(maxDrawW / width, maxDrawH / height);

    ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    const startX = (this.viewWidth - width * cellSize) / 2;
    const startY = (this.viewHeight - height * cellSize) / 2;

    ctx.save();
    ctx.translate(startX, startY);

    // # 绘制拼豆颗粒
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const code = grid[y][x];
        if (!code || code === 'EMPTY') continue;
        const color = map.get(code);
        const hex = color ? color.hex : '#000000';

        const cx = x * cellSize;
        const cy = y * cellSize;
        const r = cellSize / 2;

        ctx.beginPath();
        ctx.arc(cx + r, cy + r, Math.max(1, r - 0.5), 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.fill();

        if (cellSize >= 14) {
          ctx.fillStyle = getContrastTextColor(hex);
          ctx.font = `bold ${Math.round(cellSize * 0.35)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(code, cx + r, cy + r);
        }
      }
    }

    // # 绘制加粗网格线
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.strokeStyle = x % 10 === 0 ? 'rgba(0, 0, 0, 0.4)' : x % 5 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = x % 10 === 0 ? 1.5 : 0.5;
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height * cellSize);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.strokeStyle = y % 10 === 0 ? 'rgba(0, 0, 0, 0.4)' : y % 5 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = y % 10 === 0 ? 1.5 : 0.5;
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width * cellSize, y * cellSize);
      ctx.stroke();
    }

    ctx.restore();
  },

  onSaveImageToAlbum() {
    if (!this.canvas) return;
    this.setData({ isSavingImage: true });

    wx.canvasToTempFilePath({
      canvas: this.canvas,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            this.setData({ isSavingImage: false });
            wx.showToast({ title: '已保存至手机相册！', icon: 'success' });
          },
          fail: (err) => {
            this.setData({ isSavingImage: false });
            if (err.errMsg.indexOf('auth') !== -1) {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置中开启相册访问权限以保存图纸',
                success: (settingRes) => {
                  if (settingRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' });
            }
          }
        });
      },
      fail: () => {
        this.setData({ isSavingImage: false });
        wx.showToast({ title: '图纸生成失败', icon: 'none' });
      }
    });
  },

  onCopyBomText() {
    const text = this.data.bomData.text;
    if (!text) return;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '清单已复制！', icon: 'success' });
      }
    });
  }
});
