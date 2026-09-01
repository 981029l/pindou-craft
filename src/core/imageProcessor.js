// 工业级高保真超清拼豆采样引擎 (方案 A: 全色谱 100% 无损直通 + 自动黑白场去黄雾 + Sobel 刀锋强化)
import { findClosestBrandColor } from '../data/paletteManager';
import { reducePaletteMaxColors } from './colorQuantizer';

// 自动黑白场极值拉伸与去老照片黄雾算法
function applyAutoLevelsAndDeHaze(data, width, height) {
  const totalPixels = width * height;
  const histogram = new Uint32Array(256);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const lum = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
    histogram[lum]++;
  }

  const pLowThreshold = totalPixels * 0.02;
  const pHighThreshold = totalPixels * 0.98;

  let count = 0;
  let minLum = 0;
  let maxLum = 255;

  for (let i = 0; i < 256; i++) {
    count += histogram[i];
    if (count >= pLowThreshold) {
      minLum = i;
      break;
    }
  }

  count = totalPixels;
  for (let i = 255; i >= 0; i--) {
    count -= histogram[i];
    if (count <= pHighThreshold) {
      maxLum = i;
      break;
    }
  }

  if (maxLum - minLum < 40) {
    minLum = Math.max(0, minLum - 20);
    maxLum = Math.min(255, maxLum + 20);
  }

  const range = Math.max(1, maxLum - minLum);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    for (let c = 0; c < 3; c++) {
      let val = data[idx + c];
      val = ((val - minLum) / range) * 255;
      val = Math.max(0, Math.min(255, val));

      const normalized = val / 255;
      const sCurved = normalized < 0.5 
        ? Math.pow(normalized * 2, 1.15) / 2 
        : 1 - Math.pow((1 - normalized) * 2, 1.15) / 2;

      data[idx + c] = Math.round(sCurved * 255);
    }
  }
}

// Sobel 五官与深色边缘刀锋强化算法
function applySobelContourEnhancement(data, width, height) {
  const lums = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    lums[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const pixelIdx = idx * 4;

      const gx = 
        -lums[(y - 1) * width + (x - 1)] + lums[(y - 1) * width + (x + 1)] +
        -2 * lums[y * width + (x - 1)] + 2 * lums[y * width + (x + 1)] +
        -lums[(y + 1) * width + (x - 1)] + lums[(y + 1) * width + (x + 1)];

      const gy = 
        -lums[(y - 1) * width + (x - 1)] - 2 * lums[(y - 1) * width + x] - lums[(y - 1) * width + (x + 1)] +
        lums[(y + 1) * width + (x - 1)] + 2 * lums[(y + 1) * width + x] + lums[(y + 1) * width + (x + 1)];

      const gradMag = Math.sqrt(gx * gx + gy * gy);

      if (gradMag > 45) {
        const curLum = lums[idx];
        if (curLum < 170) {
          const darkFactor = Math.max(0.35, 1 - (gradMag / 255) * 0.75);
          data[pixelIdx] = Math.round(data[pixelIdx] * darkFactor);
          data[pixelIdx + 1] = Math.round(data[pixelIdx + 1] * darkFactor);
          data[pixelIdx + 2] = Math.round(data[pixelIdx + 2] * darkFactor);
        }
      }
    }
  }
}

// 自动探测 AI 图像中的物理豆子矩阵密度
export function autoDetectBeadGridSize(imageData, width, height) {
  try {
    const data = imageData.data;
    const startY = Math.floor(height * 0.35);
    const endY = Math.floor(height * 0.65);
    const rowStep = Math.max(1, Math.floor((endY - startY) / 10));

    let bestPitchSum = 0;
    let validRows = 0;

    for (let y = startY; y < endY; y += rowStep) {
      const lums = new Float32Array(width);
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        lums[x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }

      let maxCorr = -1;
      let peakPitch = 0;
      for (let lag = 3; lag <= 28; lag++) {
        let sum = 0;
        let count = 0;
        for (let x = 0; x < width - lag; x += 2) {
          sum += Math.abs(lums[x] - lums[x + lag]);
          count++;
        }
        const diffAvg = sum / count;
        if (diffAvg > maxCorr) {
          maxCorr = diffAvg;
          peakPitch = lag;
        }
      }

      if (peakPitch >= 3 && peakPitch <= 28) {
        bestPitchSum += peakPitch;
        validRows++;
      }
    }

    if (validRows > 0) {
      const avgPitch = bestPitchSum / validRows;
      const detectedW = Math.round(width / avgPitch);
      if (detectedW >= 60) {
        const aspect = width / height;
        return {
          gridWidth: Math.max(60, detectedW),
          gridHeight: Math.max(60, Math.round(detectedW / aspect)),
          isAutoDetected: true,
        };
      }
    }
  } catch (e) {
    console.warn('Auto bead grid detection fallback:', e);
  }

  const aspect = width / (height || 1);
  const defaultW = 160;
  return {
    gridWidth: defaultW,
    gridHeight: Math.round(defaultW / aspect),
    isAutoDetected: false,
  };
}

// 主采样流程: 方案 A 默认全色谱 100% 无损直通
export async function processImageToPindouGrid({
  imageSrc,
  gridWidth = 160,
  gridHeight = 160,
  autoDetectGrid = false,
  enableColorLimit = false,
  maxColors = null,
  brightness = 0,
  contrast = 0,
  saturation = 0,
  paletteBrand = 'MARD',
  backgroundMode = 'keep',
  solidBgColor = '#FFFFFF',
  thresholdBg = 25,
}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const fullCanvas = document.createElement('canvas');
        const imgW = img.naturalWidth || img.width || 1024;
        const imgH = img.naturalHeight || img.height || 1024;
        fullCanvas.width = imgW;
        fullCanvas.height = imgH;
        const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });
        fullCtx.imageSmoothingEnabled = false;

        const bVal = 1 + brightness / 100;
        const cVal = 1 + contrast / 100;
        const sVal = 1 + saturation / 100;
        fullCtx.filter = `brightness(${bVal}) contrast(${cVal}) saturate(${sVal})`;

        fullCtx.drawImage(img, 0, 0, imgW, imgH);
        fullCtx.filter = 'none';

        const fullImgData = fullCtx.getImageData(0, 0, imgW, imgH);
        const data = fullImgData.data;

        // 方案 A 前置强化: 自动黑白场去黄雾 + Sobel 五官加深
        applyAutoLevelsAndDeHaze(data, imgW, imgH);
        applySobelContourEnhancement(data, imgW, imgH);

        let finalW = Math.max(10, Math.round(gridWidth));
        let finalH = Math.max(10, Math.round(gridHeight));
        let detected = false;

        if (autoDetectGrid) {
          const autoRes = autoDetectBeadGridSize(fullImgData, imgW, imgH);
          finalW = autoRes.gridWidth;
          finalH = autoRes.gridHeight;
          detected = autoRes.isAutoDetected;
        }

        const blockW = imgW / finalW;
        const blockH = imgH / finalH;
        const bgR = data[0], bgG = data[1], bgB = data[2];

        // 逐格执行全色谱无损色彩吸附
        const rawGrid = [];

        for (let gy = 0; gy < finalH; gy++) {
          const row = [];
          for (let gx = 0; gx < finalW; gx++) {
            const startX = Math.floor(gx * blockW);
            const startY = Math.floor(gy * blockH);
            const endX = Math.min(imgW, Math.floor((gx + 1) * blockW));
            const endY = Math.min(imgH, Math.floor((gy + 1) * blockH));

            let minLum = 255;
            let maxLum = 0;
            let darkR = 0, darkG = 0, darkB = 0, darkCount = 0;
            let redLipR = 0, redLipG = 0, redLipB = 0, redLipCount = 0;
            let totalPixels = 0;
            let transparentCount = 0;

            const colorHistogram = new Map();

            for (let py = startY; py < endY; py++) {
              for (let px = startX; px < endX; px++) {
                const idx = (py * imgW + px) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                totalPixels++;

                if (a < 50) {
                  transparentCount++;
                  continue;
                }

                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                if (lum < minLum) minLum = lum;
                if (lum > maxLum) maxLum = lum;

                if (lum < 60) {
                  darkR += r;
                  darkG += g;
                  darkB += b;
                  darkCount++;
                }

                if (r > 120 && r > g * 1.28 && r > b * 1.28) {
                  redLipR += r;
                  redLipG += g;
                  redLipB += b;
                  redLipCount++;
                }

                const key = `${Math.round(r / 8) * 8},${Math.round(g / 8) * 8},${Math.round(b / 8) * 8}`;
                if (!colorHistogram.has(key)) {
                  colorHistogram.set(key, { count: 0, r, g, b });
                }
                colorHistogram.get(key).count++;
              }
            }

            if (transparentCount > totalPixels * 0.7) {
              row.push('EMPTY');
              continue;
            }

            let chosenR, chosenG, chosenB;

            if (redLipCount >= Math.max(1, totalPixels * 0.08)) {
              chosenR = Math.round(redLipR / redLipCount);
              chosenG = Math.round(redLipG / redLipCount);
              chosenB = Math.round(redLipB / redLipCount);
            } else if (darkCount >= Math.max(1, totalPixels * 0.10) && (maxLum - minLum > 30)) {
              chosenR = Math.round(darkR / darkCount);
              chosenG = Math.round(darkG / darkCount);
              chosenB = Math.round(darkB / darkCount);
            } else {
              let maxCount = -1;
              let dominant = { r: 255, g: 255, b: 255 };
              for (const bucket of colorHistogram.values()) {
                if (bucket.count > maxCount) {
                  maxCount = bucket.count;
                  dominant = bucket;
                }
              }
              chosenR = dominant.r;
              chosenG = dominant.g;
              chosenB = dominant.b;
            }

            if (backgroundMode === 'remove') {
              const diff = Math.abs(chosenR - bgR) + Math.abs(chosenG - bgG) + Math.abs(chosenB - bgB);
              if (diff < thresholdBg) {
                row.push('EMPTY');
                continue;
              }
            }

            // 100% 匹配品牌全色谱真实色号
            const matched = findClosestBrandColor(chosenR, chosenG, chosenB, paletteBrand);
            row.push(matched.code);
          }
          rawGrid.push(row);
        }

        // 仅在明确开启“限制色数”时才进行并色截断，默认 100% 全色谱无损直通！
        let quantizedGrid = rawGrid;
        if (enableColorLimit && maxColors && maxColors > 0) {
          quantizedGrid = reducePaletteMaxColors(rawGrid, maxColors, 'EMPTY');
        }

        resolve({
          grid: quantizedGrid,
          width: finalW,
          height: finalH,
          previewUrl: fullCanvas.toDataURL(),
          naturalWidth: imgW,
          naturalHeight: imgH,
          isAutoDetected: detected,
          paletteBrand,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      if (imageSrc.startsWith('http')) {
        fetch(imageSrc, { mode: 'cors' })
          .then(res => res.blob())
          .then(blob => {
            img.src = URL.createObjectURL(blob);
          })
          .catch(() => reject(new Error('图片解析失败，请检查网络')));
      } else {
        reject(new Error('图片加载失败'));
      }
    };

    img.src = imageSrc;
  });
}
