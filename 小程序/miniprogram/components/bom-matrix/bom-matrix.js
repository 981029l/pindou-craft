// # 双拼用料矩阵组件逻辑
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
    gridData: {
      type: Array,
      value: [],
      observer: 'updateStats'
    },
    paletteBrand: {
      type: String,
      value: 'MARD',
      observer: 'updateStats'
    },
    highlightCode: {
      type: String,
      value: ''
    }
  },

  data: {
    colorList: [],
    totalCount: 0
  },

  methods: {
    updateStats() {
      const grid = this.properties.gridData;
      const brand = this.properties.paletteBrand || 'MARD';
      if (!grid || grid.length === 0) return;

      const { map } = getPaletteDataByBrand(brand);
      const counts = new Map();
      let total = 0;

      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const code = grid[r][c];
          if (code && code !== 'EMPTY') {
            counts.set(code, (counts.get(code) || 0) + 1);
            total++;
          }
        }
      }

      const list = Array.from(counts.entries())
        .map(([code, count]) => {
          const color = map.get(code);
          const hex = color ? color.hex : '#000000';
          return {
            code,
            count,
            hex,
            name_zh: color ? color.name_zh : '未知',
            textColor: getContrastTextColor(hex)
          };
        })
        .sort((a, b) => b.count - a.count);

      this.setData({
        colorList: list,
        totalCount: total
      });
    },

    onSelectChip(e) {
      const code = e.currentTarget.dataset.code;
      this.triggerEvent('togglehighlight', { code });
      this.triggerEvent('selectcolor', { code });
    },

    onClearHighlight() {
      this.triggerEvent('togglehighlight', { code: '' });
    }
  }
});
