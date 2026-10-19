// # 离屏画布拼豆缩略图极速生成器
const { getPaletteDataByBrand } = require('./paletteManager.js'); // # 统一色库管理器

function generateSvgDataUri(gridData, brand = 'MARD') {
  if (!gridData || !gridData.length) return '';
  try {
    const h = gridData.length;
    const w = gridData[0].length;
    const { map } = getPaletteDataByBrand(brand);
    const cellSize = 10;
    const svgW = w * cellSize;
    const svgH = h * cellSize;
    let circles = '';

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const code = gridData[y][x];
        if (!code || code === 'EMPTY') continue;
        const color = map.get(code);
        const hex = color ? color.hex : '#1C1917';
        const cx = x * cellSize + cellSize / 2;
        const cy = y * cellSize + cellSize / 2;
        const r = cellSize * 0.44;
        circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${hex}" />`;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" style="background:#FAF8F5">${circles}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  } catch (e) {
    return '';
  }
}

function generateGridThumbnail(gridData, brand = 'MARD', size = 260) {
  if (!gridData || !gridData.length) return '';

  if (wx.createOffscreenCanvas) {
    try {
      const canvas = wx.createOffscreenCanvas({ type: '2d', width: size, height: size });
      if (canvas && typeof canvas.getContext === 'function') {
        const ctx = canvas.getContext('2d');
        const h = gridData.length;
        const w = gridData[0].length;
        const padding = 12; // # 留白呼吸感
        const cellSize = Math.min((size - padding * 2) / w, (size - padding * 2) / h);
        const boardW = w * cellSize;
        const boardH = h * cellSize;
        const offsetX = (size - boardW) / 2;
        const offsetY = (size - boardH) / 2;

        ctx.fillStyle = '#FAF8F5';
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(offsetX, offsetY);

        const { map } = getPaletteDataByBrand(brand);

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const code = gridData[y][x];
            if (!code || code === 'EMPTY') continue;
            const color = map.get(code);
            ctx.fillStyle = color ? color.hex : '#1C1917';
            ctx.beginPath();
            ctx.arc(
              x * cellSize + cellSize / 2,
              y * cellSize + cellSize / 2,
              cellSize * 0.44,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
        ctx.restore();

        if (typeof canvas.toDataURL === 'function') {
          const res = canvas.toDataURL('image/png');
          if (res) return res;
        }
      }
    } catch (err) {
      console.warn('generateGridThumbnail canvas failed, fallback to SVG', err);
    }
  }

  // # 终极兜底：纯字符串矢量 SVG，100% 成功率且零平台依赖
  return generateSvgDataUri(gridData, brand);
}

module.exports = {
  generateGridThumbnail,
  generateSvgDataUri
};
