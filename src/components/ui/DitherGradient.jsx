import React, { useRef, useEffect } from 'react';

/**
 * DitherGradient
 * 来自 Componentry (https://componentry.dev/components/dither-gradient) 风格的复古 Bayer 矩阵抖动像素渐变
 */
export default function DitherGradient({
  colorFrom = '#4f46e5',
  colorMid = '#7c3aed',
  colorTo = '#db2777',
  intensity = 0.18,
  speed = 1.5,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animId;
    let t = 0;

    // 4x4 Bayer 抖动阈值矩阵 (0~15 归一化)
    const bayer4x4 = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    // 解析 hex 颜色为 [r, g, b]
    const hexToRgb = (hex) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };

    const c1 = hexToRgb(colorFrom);
    const c2 = hexToRgb(colorMid);
    const c3 = hexToRgb(colorTo);

    const lerpColor = (a, b, factor) => [
      a[0] + (b[0] - a[0]) * factor,
      a[1] + (b[1] - a[1]) * factor,
      a[2] + (b[2] - a[2]) * factor,
    ];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      t += 0.008 * speed;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;

          // 动态波浪渐变坐标因子 (0 ~ 1)
          const nx = x / width;
          const ny = y / height;
          const wave = Math.sin(nx * 3 + t) * 0.5 + Math.cos(ny * 2 - t * 0.7) * 0.5;
          const factor = Math.max(0, Math.min(1, (nx + ny + wave * 0.3) * 0.5));

          // 两段渐变插值
          let baseCol;
          if (factor < 0.5) {
            baseCol = lerpColor(c1, c2, factor * 2);
          } else {
            baseCol = lerpColor(c2, c3, (factor - 0.5) * 2);
          }

          // Bayer 抖动增益
          const bayerValue = (bayer4x4[y % 4][x % 4] / 16 - 0.5) * intensity * 255;

          data[idx] = Math.max(0, Math.min(255, baseCol[0] + bayerValue));
          data[idx + 1] = Math.max(0, Math.min(255, baseCol[1] + bayerValue));
          data[idx + 2] = Math.max(0, Math.min(255, baseCol[2] + bayerValue));
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [colorFrom, colorMid, colorTo, intensity, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={40}
      className={`pointer-events-none absolute inset-0 w-full h-full object-cover ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
