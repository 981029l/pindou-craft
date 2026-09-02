import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, FileImage, Printer } from 'lucide-react';
import GlassCard from './GlassCard';
import { getPaletteDataByBrand } from '../data/paletteManager';

export default function ExportModal({ isOpen, onClose, gridData, paletteBrand = 'MARD' }) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const { map: activeColorMap } = getPaletteDataByBrand(paletteBrand);

  // 统计每种色号的使用颗数
  const colorCounts = new Map();
  let totalBeads = 0;

  gridData.forEach((row) => {
    row.forEach((code) => {
      if (code && code !== 'EMPTY') {
        colorCounts.set(code, (colorCounts.get(code) || 0) + 1);
        totalBeads++;
      }
    });
  });

  const sortedColors = Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1]);

  // 1. 复制 BOM 文本到剪贴板
  const handleCopyBOM = () => {
    let text = `【拼豆手作物料清单 (BOM) - ${paletteBrand}品牌】\n`;
    text += `总用豆数: ${totalBeads} 颗 | 包含色数: ${sortedColors.length} 种\n`;
    text += `----------------------------------------\n`;
    sortedColors.forEach(([code, count]) => {
      const color = activeColorMap.get(code);
      text += `[${code}] ${color ? color.name_zh : '未知'} : ${count} 颗 (${((count / totalBeads) * 100).toFixed(1)}%)\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. 导出 CSV 采购清单表格
  const handleExportCSV = () => {
    let csv = `\uFEFF品牌,色号,中文名称,HEX颜色,用量(颗),占比(%)\n`;
    sortedColors.forEach(([code, count]) => {
      const color = activeColorMap.get(code);
      const name = color ? color.name_zh : '未知';
      const hex = color ? color.hex : '#000000';
      const pct = ((count / totalBeads) * 100).toFixed(2);
      csv += `"${paletteBrand}","${code}","${name}","${hex}",${count},${pct}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `拼豆采购清单_${paletteBrand}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. 导出高清 PNG 图纸
  const handleExportPNG = () => {
    setIsExporting(true); // # 开启导出状态
    setTimeout(() => {
      const height = gridData.length;
      const width = gridData[0].length;
      const cellSize = 22; // # 单格像素
      const padding = 50; // # 页面边距
      const rulerSize = 24; // # 标尺高度

      // 计算底部用料表行数与高度
      const chipsPerRow = Math.max(4, Math.floor((width * cellSize) / 105));
      const bomRows = Math.ceil(sortedColors.length / chipsPerRow);
      const bomHeight = 60 + bomRows * 34;

      const canvas = document.createElement('canvas');
      canvas.width = width * cellSize + padding * 2 + rulerSize;
      canvas.height = height * cellSize + padding * 2 + rulerSize + bomHeight + 40;
      const ctx = canvas.getContext('2d');

      // 1. 画布整体纯白背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 顶部大标题与工程信息
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`PinDou Atelier · 拼豆工业级高清图纸 (${paletteBrand} 色卡)`, padding, 36);

      const gridStartX = padding + rulerSize;
      const gridStartY = padding + 40 + rulerSize;

      // 3. 绘制 X/Y 轴精准标尺
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(gridStartX, gridStartY - rulerSize, width * cellSize, rulerSize);
      ctx.fillRect(gridStartX - rulerSize, gridStartY, rulerSize, height * cellSize);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(gridStartX, gridStartY - rulerSize, width * cellSize, rulerSize);
      ctx.strokeRect(gridStartX - rulerSize, gridStartY, rulerSize, height * cellSize);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let x = 0; x < width; x++) {
        const num = x + 1;
        if (num % 5 === 0 || num === 1 || width <= 50) {
          ctx.fillText(String(num), gridStartX + x * cellSize + cellSize / 2, gridStartY - rulerSize / 2);
        }
      }

      for (let y = 0; y < height; y++) {
        const num = y + 1;
        if (num % 5 === 0 || num === 1 || height <= 50) {
          ctx.fillText(String(num), gridStartX - rulerSize / 2, gridStartY + y * cellSize + cellSize / 2);
        }
      }

      // 4. 网格豆子与色号填充
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const code = gridData[y][x];
          const px = gridStartX + x * cellSize;
          const py = gridStartY + y * cellSize;

          if (code === 'EMPTY') {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#fafafa' : '#f4f4f5';
            ctx.fillRect(px, py, cellSize, cellSize);
          } else {
            const color = activeColorMap.get(code);
            const hex = color ? color.hex : '#000000';

            ctx.fillStyle = hex;
            ctx.fillRect(px, py, cellSize, cellSize);

            // 文字
            ctx.fillStyle = getContrastTextColor(hex);
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(code, px + cellSize / 2, py + cellSize / 2);
          }
        }
      }

      // 5. 5×5 / 10×10 加粗网格分块线
      for (let y = 0; y <= height; y++) {
        const py = gridStartY + y * cellSize;
        ctx.beginPath();
        ctx.moveTo(gridStartX, py);
        ctx.lineTo(gridStartX + width * cellSize, py);
        ctx.strokeStyle = y % 10 === 0 ? 'rgba(51, 65, 85, 0.85)' : y % 5 === 0 ? 'rgba(100, 116, 139, 0.65)' : 'rgba(226, 232, 240, 0.6)';
        ctx.lineWidth = y % 10 === 0 ? 1.4 : y % 5 === 0 ? 0.9 : 0.4;
        ctx.stroke();
      }

      for (let x = 0; x <= width; x++) {
        const px = gridStartX + x * cellSize;
        ctx.beginPath();
        ctx.moveTo(px, gridStartY);
        ctx.lineTo(px, gridStartY + height * cellSize);
        ctx.strokeStyle = x % 10 === 0 ? 'rgba(51, 65, 85, 0.85)' : x % 5 === 0 ? 'rgba(100, 116, 139, 0.65)' : 'rgba(226, 232, 240, 0.6)';
        ctx.lineWidth = x % 10 === 0 ? 1.4 : x % 5 === 0 ? 0.9 : 0.4;
        ctx.stroke();
      }

      // 6. 底部竞品同款双拼 BOM 用料卡片矩阵
      const bomStartY = gridStartY + height * cellSize + 24;

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`PinDou | ${paletteBrand} | 规格 ${width}×${height} 格 | 总计 ${sortedColors.length} 色 / ${totalBeads} 粒`, padding, bomStartY);

      const chipW = 95;
      const chipH = 26;
      sortedColors.forEach(([code, count], idx) => {
        const col = idx % chipsPerRow;
        const row = Math.floor(idx / chipsPerRow);
        const cx = padding + col * (chipW + 8);
        const cy = bomStartY + 14 + row * (chipH + 6);

        const color = activeColorMap.get(code);
        const hex = color ? color.hex : '#000000';
        const contrastText = getContrastTextColor(hex);

        // 外边框
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, chipW, chipH);

        // 左半边: 色块与色号
        ctx.fillStyle = hex;
        ctx.fillRect(cx, cy, 48, chipH);
        ctx.fillStyle = contrastText;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(code, cx + 24, cy + chipH / 2);

        // 右半边: 白底颗数
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 48, cy, chipW - 48, chipH);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(count), cx + 48 + (chipW - 48) / 2, cy + chipH / 2);
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `拼豆高清图纸_${paletteBrand}_${width}x${height}.png`;
      link.click();

      setIsExporting(false);
    }, 100);
  };

  function getContrastTextColor(hex) {
    if (!hex) return '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 140 ? '#09090b' : '#ffffff';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-sm animate-studio-in">
      <div className="w-full max-w-2xl">
        <GlassCard className="p-4 sm:p-6 border border-stone-300 shadow-2xl relative max-h-[90vh] flex flex-col bg-white">
          {/* 标题 */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900">
                导出图纸与物料清单 (BOM)
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400">
                色板：<strong className="text-stone-700">{paletteBrand}</strong> · 总用豆 <strong className="text-stone-700">{totalBeads}</strong> 粒 · 共 <strong className="text-stone-700">{sortedColors.length}</strong> 种颜色
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 导出动作卡片区 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-left transition-all hover:border-stone-400 group"
            >
              <FileImage className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">下载高清图纸 (PNG)</div>
              <div className="text-[11px] text-stone-400 mt-0.5">含坐标刻度与底部用料表</div>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-left transition-all hover:border-stone-400 group"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">导出采购清单 (CSV)</div>
              <div className="text-[11px] text-stone-400 mt-0.5">含颗数与色号名称表格</div>
            </button>

            <button
              onClick={() => window.print()}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-left transition-all hover:border-stone-400 group"
            >
              <Printer className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">A4 实体打印</div>
              <div className="text-[11px] text-stone-400 mt-0.5">直接发送至打印机</div>
            </button>
          </div>

          {/* 竞品同款双拼物料明细胶囊矩阵 */}
          <div className="flex items-center justify-between mt-1 mb-2">
            <span className="text-xs font-bold text-stone-800">
              用料胶囊明细 ({sortedColors.length} 色)
            </span>
            <button
              onClick={handleCopyBOM}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制明细' : '复制物料文本'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border border-stone-200 rounded-xl p-2 bg-stone-50/40">
            <div className="flex flex-wrap gap-1.5">
              {sortedColors.map(([code, count]) => {
                const color = activeColorMap.get(code);
                const hex = color ? color.hex : '#ffffff';
                const contrastText = getContrastTextColor(hex);
                return (
                  <div
                    key={code}
                    className="inline-flex items-stretch rounded border border-stone-300 text-xs overflow-hidden shadow-2xs bg-white"
                  >
                    {/* 左侧色块 + 色号 */}
                    <div
                      className="px-2.5 py-1 font-mono font-bold text-[11px] flex items-center justify-center min-w-[42px]"
                      style={{ backgroundColor: hex, color: contrastText }}
                    >
                      {code}
                    </div>
                    {/* 右侧白底颗数 */}
                    <div className="px-2.5 py-1 bg-white font-mono font-bold text-stone-900 text-[11px] flex items-center justify-center border-l border-stone-200 min-w-[36px]">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部关闭 */}
          <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm transition-all"
            >
              完成
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
