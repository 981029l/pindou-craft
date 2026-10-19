// # 微信小程序 Canvas 2D 图像采样与色彩量化处理管线
const { findClosestBrandColor, getPaletteDataByBrand } = require('./paletteManager.js');
const { reducePaletteMaxColors } = require('./colorQuantizer.js');

async function processImageToGrid({
  canvas, // # 原生 Canvas 2D 实例
  imagePath, // # 微信临时图片路径
  targetWidth = 50, // # 目标网格宽度
  targetHeight = 50, // # 目标网格高度
  maxDimension, // # 最大基准边长 (启用等比自适应)
  paletteBrand = 'MARD', // # 品牌色卡
  maxColors = 48, // # 最大用色上限
  brightness = 0, // # 亮度调节 (-50 ~ 50)
  contrast = 0, // # 对比度调节 (-50 ~ 50)
  saturation = 0, // # 饱和度调节 (-50 ~ 50)
  removeBg = false, // # 是否抠除背景
}) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      return reject(new Error('Canvas 实例未就绪'));
    }

    const ctx = canvas.getContext('2d');
    const img = canvas.createImage();

    img.onload = () => {
      let finalW = targetWidth;
      let finalH = targetHeight;

      // # 智能等比自适应：根据原图真实宽高比，以基准边长计算网格尺寸，100% 杜绝压扁
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;

      if (naturalW && naturalH) {
        const baseDim = maxDimension || Math.max(targetWidth, targetHeight) || 50;
        if (naturalW >= naturalH) {
          finalW = baseDim;
          finalH = Math.max(10, Math.round(baseDim * (naturalH / naturalW)));
        } else {
          finalH = baseDim;
          finalW = Math.max(10, Math.round(baseDim * (naturalW / naturalH)));
        }
      }

      canvas.width = finalW;
      canvas.height = finalH;

      // # 绘制并缩放至目标分辨率 (100% 保真比例)
      ctx.clearRect(0, 0, finalW, finalH);
      ctx.drawImage(img, 0, 0, finalW, finalH);

      const imgData = ctx.getImageData(0, 0, finalW, finalH);
      const data = imgData.data;

      const grid = [];
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let y = 0; y < finalH; y++) {
        const row = [];
        for (let x = 0; x < finalW; x++) {
          const idx = (y * finalW + x) * 4;
          let r = data[idx];
          let g = data[idx + 1];
          let b = data[idx + 2];
          let a = data[idx + 3];

          // # 透明度或背景抠除检测
          if (a < 32 || (removeBg && r > 240 && g > 240 && b > 240)) {
            row.push('EMPTY');
            continue;
          }

          // # 亮度调节
          r = Math.min(255, Math.max(0, r + brightness * 2.55));
          g = Math.min(255, Math.max(0, g + brightness * 2.55));
          b = Math.min(255, Math.max(0, b + brightness * 2.55));

          // # 对比度调节
          r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));

          // # 匹配最接近的标准色号
          const closest = findClosestBrandColor(r, g, b, paletteBrand);
          row.push(closest.code);
        }
        grid.push(row);
      }

      // # 如果开启了色数收敛
      const finalGrid = maxColors < 200 ? reducePaletteMaxColors(grid, maxColors) : grid;
      resolve(finalGrid);
    };

    img.onerror = (err) => {
      reject(err);
    };

    img.src = imagePath;
  });
}

module.exports = {
  processImageToGrid
};

