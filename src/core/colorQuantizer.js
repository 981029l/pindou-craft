// 颜色空间转换与 MARD / 多品牌拼豆色彩量化核心模块
import { MARD_PALETTE } from '../data/mardPalette';

// RGB 转 CIE-Lab
export function rgb2lab([r, g, b]) {
  let r_ = r / 255, g_ = g / 255, b_ = b / 255;
  r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
  g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
  b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

  let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) / 0.95047;
  let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) / 1.00000;
  let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

// 快速 Lab 欧氏距离
export function deltaE76(lab1, lab2) {
  if (!lab1 || !lab2) return Infinity;
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

// 约束最大用色种类 (保留最高频颜色，低频色合并至最近的高频色)
export function reducePaletteMaxColors(grid, maxColors = 36, emptyCode = 'EMPTY') {
  const colorFreq = new Map();

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const code = grid[r][c];
      if (code && code !== emptyCode) {
        colorFreq.set(code, (colorFreq.get(code) || 0) + 1);
      }
    }
  }

  if (colorFreq.size <= maxColors) {
    return grid;
  }

  // 选出频次前 maxColors 的主导颜色代码
  const sortedColors = Array.from(colorFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([code]) => code);

  const topColors = new Set(sortedColors.slice(0, maxColors));
  const fallbackColor = sortedColors[0] || emptyCode;

  // 将不在 topColors 中的低频颜色吸附为最近的高频色
  const result = grid.map(row =>
    row.map(code => {
      if (!code || code === emptyCode || topColors.has(code)) {
        return code;
      }
      return fallbackColor;
    })
  );

  return result;
}
