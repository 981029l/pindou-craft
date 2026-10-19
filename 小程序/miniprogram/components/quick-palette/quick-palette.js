// # 快捷调色盘抽屉组件逻辑
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
    styleIsolation: 'apply-shared'
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: 'initPalette'
    },
    paletteBrand: {
      type: String,
      value: 'MARD',
      observer: 'initPalette'
    },
    selectedColorCode: {
      type: String,
      value: 'H7'
    },
    gridData: {
      type: Array,
      value: [],
      observer: 'updateUsedColors'
    }
  },

  data: {
    allColors: [],
    displayColors: [],
    usedColors: [],
    totalBrandColors: 0,
    searchKeyword: ''
  },

  methods: {
    initPalette() {
      if (!this.properties.visible) return; // # 抽屉未打开时不执行初始化，避免初始开销
      const brand = this.properties.paletteBrand || 'MARD';
      const { palette } = getPaletteDataByBrand(brand);
      const list = (palette || []).map(c => ({
        ...c,
        textColor: getContrastTextColor(c.hex)
      }));

      this.setData({
        allColors: list,
        displayColors: list,
        totalBrandColors: list.length,
        searchKeyword: ''
      });
      this.updateUsedColors();
    },

    updateUsedColors() {
      const grid = this.properties.gridData;
      const brand = this.properties.paletteBrand || 'MARD';
      if (!grid || grid.length === 0) return;

      const { map } = getPaletteDataByBrand(brand);
      const set = new Set();
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const code = grid[r][c];
          if (code && code !== 'EMPTY') {
            set.add(code);
          }
        }
      }

      const used = Array.from(set).map(code => {
        const color = map.get(code);
        return {
          code,
          hex: color ? color.hex : '#000000',
          name_zh: color ? color.name_zh : ''
        };
      });

      this.setData({ usedColors: used });
    },

    onSearchInput(e) {
      const keyword = (e.detail.value || '').toLowerCase().trim();
      const all = this.data.allColors;
      if (!keyword) {
        this.setData({ displayColors: all, searchKeyword: '' });
        return;
      }

      const filtered = all.filter(c => 
        c.code.toLowerCase().includes(keyword) || (c.name_zh && c.name_zh.includes(keyword))
      );
      this.setData({ displayColors: filtered, searchKeyword: keyword });
    },

    onClearSearch() {
      this.setData({
        displayColors: this.data.allColors,
        searchKeyword: ''
      });
    },

    onPickColor(e) {
      const code = e.currentTarget.dataset.code;
      this.triggerEvent('selectcolor', { code });
      this.onClose();
    },

    onClose() {
      this.triggerEvent('close');
    }
  }
});
