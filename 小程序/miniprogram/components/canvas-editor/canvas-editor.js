// # 原生 Canvas 2D 交互编辑器组件逻辑
const { getPaletteDataByBrand } = require('../../utils/paletteManager.js');

function getContrastTextColor(hex = '#000000') {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1C1917' : '#FFFFFF';
}

Component({
  options: {
    styleIsolation: 'apply-shared' // # 共享全局样式与 Lucide 图标库
  },

  properties: {
    gridData: {
      type: Array,
      value: [],
      observer: 'onGridDataChanged'
    },
    paletteBrand: {
      type: String,
      value: 'MARD',
      observer: 'renderCanvas'
    },
    selectedColorCode: {
      type: String,
      value: 'H7',
      observer: 'updateActiveColor'
    },
    highlightColorCode: {
      type: String,
      value: '',
      observer: 'renderCanvas'
    },
    hidden: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (!newVal && this.ctx) {
          setTimeout(() => { this.renderCanvas(); }, 50);
        }
      }
    }
  },

  data: {
    currentTool: 'pencil', // # pencil | bucket | picker | eraser | hand
    beadStyle: 'glossy', // # glossy | flat
    zoom: 1,
    zoomPercent: 100,
    panX: 0,
    panY: 0,
    hoverProbe: null,
    activeColorHex: '#010101',
    activeColorName: '纯黑',
    activeColorTextColor: '#FFFFFF',
    canUndo: false,
    canRedo: false
  },

  lifetimes: {
    ready() {
      this.initCanvas();
      this.history = [];
      this.historyIndex = -1;
      this.lastTapTime = 0;
    }
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery();
      query.select('#beadCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0] || !res[0].node) return;
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2) || 2;

          canvas.width = Math.round(res[0].width * dpr);
          canvas.height = Math.round(res[0].height * dpr);

          this.dpr = dpr;
          this.canvas = canvas;
          this.ctx = ctx;
          this.viewWidth = res[0].width;
          this.viewHeight = res[0].height;

          this.fitToViewport();
          this.updateActiveColor();
        });
    },

    onGridDataChanged() {
      if (this.properties.gridData && this.properties.gridData.length > 0) {
        this.fitToViewport();
      }
    },

    updateActiveColor() {
      const code = this.properties.selectedColorCode || 'H7';
      const brand = this.properties.paletteBrand || 'MARD';
      const { map } = getPaletteDataByBrand(brand);
      const color = map.get(code);

      const hex = color ? color.hex : '#010101';
      this.setData({
        activeColorHex: hex,
        activeColorName: color ? color.name_zh : '选择颜色',
        activeColorTextColor: getContrastTextColor(hex)
      });
    },

    fitToViewport() {
      const grid = this.properties.gridData;
      if (!grid || grid.length === 0) return;
      if (!this.viewWidth || !this.viewHeight) {
        setTimeout(() => this.fitToViewport(), 50);
        return;
      }

      const gridH = grid.length;
      const gridW = grid[0].length;

      const padding = 20; // # 20px 黄金呼吸边距
      const scaleX = (this.viewWidth - padding * 2) / (gridW * 10);
      const scaleY = (this.viewHeight - padding * 2) / (gridH * 10);
      const zoom = Math.max(0.01, Math.min(scaleX, scaleY));

      const panX = (this.viewWidth - gridW * 10 * zoom) / 2;
      const panY = (this.viewHeight - gridH * 10 * zoom) / 2;

      this.setData({
        zoom,
        zoomPercent: Math.round(zoom * 100),
        panX,
        panY
      }, () => {
        this.renderCanvas();
      });
    },

    renderCanvas() {
      if (!this.ctx || !this.properties.gridData || this.properties.gridData.length === 0) return;
      const ctx = this.ctx;
      const dpr = this.dpr || 2;
      const grid = this.properties.gridData;
      const height = grid.length;
      const width = grid[0].length;

      const { zoom, panX, panY, beadStyle } = this.data;
      const highlight = this.properties.highlightColorCode;
      const brand = this.properties.paletteBrand || 'MARD';
      const { map } = getPaletteDataByBrand(brand);

      const cellSize = 10 * zoom;
      const boardW = width * cellSize;
      const boardH = height * cellSize;

      // # 1. 严格重置设备像素矩阵，彻底杜绝 DPR 累乘溢出
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);

      // # 2. 严格执行 GPU 视口硬件裁切，100% 杜绝任何图元溢出卡片
      ctx.beginPath();
      ctx.rect(0, 0, this.viewWidth, this.viewHeight);
      ctx.clip();

      ctx.save();
      ctx.translate(panX, panY);

      // # 2. 绘制温润高品质的实体插板底座
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, boardW, boardH);
      ctx.strokeStyle = '#D6D3D1';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, boardW, boardH);

      // # 3. 逐格绘制拼豆与插孔
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const code = grid[y][x];
          const cx = x * cellSize;
          const cy = y * cellSize;
          const radius = cellSize / 2;

          if (!code || code === 'EMPTY') {
            // # 空孔位: 绘制温润插孔小圆点
            if (cellSize >= 3) {
              ctx.beginPath();
              ctx.arc(cx + radius, cy + radius, Math.max(0.8, radius * 0.3), 0, Math.PI * 2);
              ctx.fillStyle = '#E7E5E4';
              ctx.fill();
            }
            continue;
          }

          const color = map.get(code);
          const hex = color ? color.hex : '#000000';
          const isHighlighted = !highlight || highlight === code;

          ctx.save();
          if (!isHighlighted) {
            ctx.globalAlpha = 0.15; // # 高亮锁定暗化
          }

          if (beadStyle === 'glossy') {
            // # 拟物微珠质感: 基础外圆
            ctx.beginPath();
            ctx.arc(cx + radius, cy + radius, Math.max(1, radius - 0.4), 0, Math.PI * 2);
            ctx.fillStyle = hex;
            ctx.fill();

            // # 中心插孔
            if (cellSize >= 6) {
              ctx.beginPath();
              ctx.arc(cx + radius, cy + radius, radius * 0.35, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
              ctx.fill();
            }
          } else {
            // # 平面像素方块
            ctx.fillStyle = hex;
            ctx.fillRect(cx, cy, cellSize, cellSize);
          }

          // # 深度放大显示色号
          if (cellSize >= 20 && isHighlighted) {
            ctx.fillStyle = getContrastTextColor(hex);
            ctx.font = `bold ${Math.round(cellSize * 0.32)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(code, cx + radius, cy + radius);
          }

          ctx.restore();
        }
      }

      // # 4. 绘制网格线
      for (let x = 0; x <= width; x++) {
        if (x % 10 === 0) {
          ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
          ctx.lineWidth = 1.2;
        } else if (x % 5 === 0) {
          ctx.strokeStyle = 'rgba(120, 113, 108, 0.25)';
          ctx.lineWidth = 0.8;
        } else if (cellSize >= 8) {
          ctx.strokeStyle = 'rgba(231, 229, 228, 0.8)';
          ctx.lineWidth = 0.5;
        } else {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, boardH);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y++) {
        if (y % 10 === 0) {
          ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
          ctx.lineWidth = 1.2;
        } else if (y % 5 === 0) {
          ctx.strokeStyle = 'rgba(120, 113, 108, 0.25)';
          ctx.lineWidth = 0.8;
        } else if (cellSize >= 8) {
          ctx.strokeStyle = 'rgba(231, 229, 228, 0.8)';
          ctx.lineWidth = 0.5;
        } else {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(boardW, y * cellSize);
        ctx.stroke();
      }

      ctx.restore();
    },

    // # 触控手势处理 (单指绘制 / 双指缩放平移 / 双击 350% 焦点对焦)
    onTouchStart(e) {
      const touches = e.touches;
      const now = Date.now();

      // # 双击检测
      if (touches.length === 1 && (now - this.lastTapTime < 300)) {
        const touch = touches[0];
        this.handleDoubleTap(touch.x, touch.y);
        this.lastTapTime = 0;
        return;
      }
      this.lastTapTime = now;

      if (this.probeTimer) {
        clearTimeout(this.probeTimer);
        this.probeTimer = null;
      }

      if (touches.length === 1) {
        this.touchStart = { x: touches[0].x, y: touches[0].y };
        if (this.data.currentTool === 'hand') {
          this.startPan = { x: this.data.panX, y: this.data.panY };
        } else {
          this.handleDrawAction(touches[0].x, touches[0].y);
        }
      } else if (touches.length >= 2) {
        // # 双指缩放准备
        const dx = touches[0].x - touches[1].x;
        const dy = touches[0].y - touches[1].y;
        this.pinchStartDist = Math.sqrt(dx * dx + dy * dy);
        this.pinchStartZoom = this.data.zoom;
        this.startPan = { x: this.data.panX, y: this.data.panY };
      }
    },

    onTouchMove(e) {
      const touches = e.touches;
      if (touches.length === 1) {
        if (this.data.currentTool === 'hand') {
          const dx = touches[0].x - this.touchStart.x;
          const dy = touches[0].y - this.touchStart.y;
          this.setData({
            panX: this.startPan.x + dx,
            panY: this.startPan.y + dy
          }, () => this.renderCanvas());
        } else {
          this.handleDrawAction(touches[0].x, touches[0].y);
        }
      } else if (touches.length >= 2 && this.pinchStartDist) {
        const dx = touches[0].x - touches[1].x;
        const dy = touches[0].y - touches[1].y;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        const scale = currentDist / this.pinchStartDist;
        const newZoom = Math.max(0.2, Math.min(8, this.pinchStartZoom * scale));

        this.setData({
          zoom: newZoom,
          zoomPercent: Math.round(newZoom * 100)
        }, () => this.renderCanvas());
      }
    },

    onTouchEnd() {
      this.touchStart = null;
      this.pinchStartDist = null;
      if (this.probeTimer) clearTimeout(this.probeTimer);
      this.probeTimer = setTimeout(() => {
        this.setData({ hoverProbe: null });
      }, 1500);
    },

    handleDoubleTap(touchX, touchY) {
      if (this.data.zoom > 2) {
        this.fitToViewport();
      } else {
        // # 聚焦放大到 350%
        const newZoom = 3.5;
        const cellSize = 10 * this.data.zoom;
        const targetCellX = (touchX - this.data.panX) / cellSize;
        const targetCellY = (touchY - this.data.panY) / cellSize;

        const newPanX = this.viewWidth / 2 - targetCellX * 10 * newZoom;
        const newPanY = this.viewHeight / 2 - targetCellY * 10 * newZoom;

        this.setData({
          zoom: newZoom,
          zoomPercent: 350,
          panX: newPanX,
          panY: newPanY
        }, () => this.renderCanvas());
      }
    },

    handleDrawAction(touchX, touchY) {
      const grid = this.properties.gridData;
      if (!grid || grid.length === 0) return;

      const cellSize = 10 * this.data.zoom;
      const cellX = Math.floor((touchX - this.data.panX) / cellSize);
      const cellY = Math.floor((touchY - this.data.panY) / cellSize);

      const height = grid.length;
      const width = grid[0].length;

      if (cellX < 0 || cellX >= width || cellY < 0 || cellY >= height) return;

      const tool = this.data.currentTool;
      const currentColor = grid[cellY][cellX];
      const selectedColor = this.properties.selectedColorCode;

      // # 实时更新坐标探针 (独立全宽指示微舱)
      const brand = this.properties.paletteBrand || 'MARD';
      const { map } = getPaletteDataByBrand(brand);
      const color = map.get(currentColor);
      const hex = color ? color.hex : '#57534E';

      this.setData({
        hoverProbe: {
          x: cellX + 1,
          y: cellY + 1,
          code: currentColor,
          name_zh: color ? color.name_zh : (currentColor === 'EMPTY' ? '透明空格' : '标准色'),
          colorHex: hex,
          textColor: getContrastTextColor(hex)
        }
      });

      if (tool === 'picker') {
        if (currentColor && currentColor !== 'EMPTY') {
          this.triggerEvent('selectcolor', { code: currentColor });
          this.setData({ currentTool: 'pencil' });
        }
        return;
      }

      if (tool === 'pencil') {
        if (currentColor !== selectedColor) {
          const newGrid = grid.map(row => row.slice());
          newGrid[cellY][cellX] = selectedColor;
          this.triggerEvent('gridchange', { gridData: newGrid });
        }
      } else if (tool === 'eraser') {
        if (currentColor !== 'EMPTY') {
          const newGrid = grid.map(row => row.slice());
          newGrid[cellY][cellX] = 'EMPTY';
          this.triggerEvent('gridchange', { gridData: newGrid });
        }
      }
    },

    onSelectTool(e) {
      const tool = e.currentTarget.dataset.tool;
      this.setData({ currentTool: tool });
    },

    onToggleBeadStyle() {
      this.setData({
        beadStyle: this.data.beadStyle === 'glossy' ? 'flat' : 'glossy'
      }, () => this.renderCanvas());
    },

    onZoomIn() {
      const newZoom = Math.min(8, this.data.zoom * 1.3);
      this.setData({ zoom: newZoom, zoomPercent: Math.round(newZoom * 100) }, () => this.renderCanvas());
    },

    onZoomOut() {
      const newZoom = Math.max(0.2, this.data.zoom / 1.3);
      this.setData({ zoom: newZoom, zoomPercent: Math.round(newZoom * 100) }, () => this.renderCanvas());
    },

    onSetZoom(e) {
      const scale = parseFloat(e.currentTarget.dataset.scale);
      this.setData({ zoom: scale, zoomPercent: Math.round(scale * 100) }, () => this.renderCanvas());
    },

    onFitViewport() {
      this.fitToViewport();
    },

    onOpenQuickPalette() {
      this.triggerEvent('openpalette');
    },

    exportPreviewTempFilePath() {
      return new Promise((resolve) => {
        if (!this.canvas) {
          resolve('');
          return;
        }
        wx.canvasToTempFilePath({
          canvas: this.canvas,
          fileType: 'png',
          quality: 0.85,
          success: (res) => resolve(res.tempFilePath),
          fail: () => resolve('')
        });
      });
    }
  }
});
