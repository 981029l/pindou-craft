// # A4 高清拼豆图纸渲染与 BOM 采购清单生成工具
const { getPaletteDataByBrand } = require('./paletteManager.js');

function generateBomCsv(gridData, paletteBrand = 'MARD') {
  const { map } = getPaletteDataByBrand(paletteBrand);
  const counts = new Map();
  let total = 0;

  if (gridData) {
    for (let r = 0; r < gridData.length; r++) {
      for (let c = 0; c < gridData[r].length; c++) {
        const code = gridData[r][c];
        if (code && code !== 'EMPTY') {
          counts.set(code, (counts.get(code) || 0) + 1);
          total++;
        }
      }
    }
  }

  const list = Array.from(counts.entries())
    .map(([code, count]) => {
      const color = map.get(code);
      return {
        code,
        count,
        name_zh: color ? color.name_zh : '未知',
        hex: color ? color.hex : '#000000',
        series: color ? color.series : '-',
      };
    })
    .sort((a, b) => b.count - a.count);

  let text = `【PinDou 拼豆耗材清单 (${paletteBrand})】\n总颗粒数: ${total} 颗 | 使用色数: ${list.length} 色\n--------------------------------\n`;
  list.forEach((item, index) => {
    text += `${index + 1}. [${item.code}] ${item.name_zh}: ${item.count} 颗\n`;
  });

  return { list, total, text };
}

module.exports = {
  generateBomCsv
};

