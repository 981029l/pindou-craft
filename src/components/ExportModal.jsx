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
    setIsExporting(true);
    setTimeout(() => {
      const height = gridData.length;
      const width = gridData[0].length;
      const cellSize = 24;
      const padding = 60;

      const canvas = document.createElement('canvas');
      canvas.width = width * cellSize + padding * 2;
      canvas.height = height * cellSize + padding * 2 + 100;
      const ctx = canvas.getContext('2d');

      // 背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 标题
      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`拼豆高清图纸 (${paletteBrand} 色板)`, padding, 40);

      ctx.fillStyle = '#71717a';
      ctx.font = '14px sans-serif';
      ctx.fillText(`规格: ${width}x${height} 格 | 总颗数: ${totalBeads} 颗 | 用色: ${sortedColors.length} 种`, padding, 64);

      // 网格
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const code = gridData[y][x];
          const px = padding + x * cellSize;
          const py = padding + 80 + y * cellSize;

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

          ctx.strokeStyle = '#e4e4e7';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, cellSize, cellSize);
        }
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-studio-in">
      <div className="w-full max-w-2xl">
        <GlassCard className="p-6 border border-stone-300 shadow-2xl relative max-h-[85vh] flex flex-col bg-white">
          {/* 标题 */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                导出图纸与物料清单 (BOM)
              </h2>
              <p className="text-xs text-stone-400">
                当前色板：<strong className="text-stone-700">{paletteBrand}</strong> · 总用豆 <strong className="text-stone-700">{totalBeads}</strong> 颗 · 共 <strong className="text-stone-700">{sortedColors.length}</strong> 种颜色
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-left transition-all hover:border-stone-400 group"
            >
              <FileImage className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">下载高清图纸 (PNG)</div>
              <div className="text-[11px] text-stone-400 mt-0.5">带色号与网格标注</div>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-left transition-all hover:border-stone-400 group"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">导出采购清单 (CSV)</div>
              <div className="text-[11px] text-stone-400 mt-0.5">含颗数与色号名称</div>
            </button>

            <button
              onClick={() => window.print()}
              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-left transition-all hover:border-stone-400 group"
            >
              <Printer className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">A4 实体打印</div>
              <div className="text-[11px] text-stone-400 mt-0.5">直接发送至打印机</div>
            </button>
          </div>

          {/* 物料明细表 */}
          <div className="flex items-center justify-between mt-2 mb-2">
            <span className="text-xs font-bold text-stone-800">用量明细</span>
            <button
              onClick={handleCopyBOM}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制明细' : '复制物料文本'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border border-stone-200 rounded-xl p-1 bg-stone-50/40">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1">
              {sortedColors.map(([code, count]) => {
                const color = activeColorMap.get(code);
                const hex = color ? color.hex : '#ffffff';
                const name = color ? color.name_zh : '未知';
                return (
                  <div
                    key={code}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 text-xs shadow-xs"
                  >
                    <div
                      className="w-5 h-5 rounded-md border border-stone-300 shadow-inner shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-stone-900 truncate">
                        {code}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">
                        {name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-stone-900 font-mono">{count}</div>
                      <div className="text-[9px] text-stone-400">
                        {((count / totalBeads) * 100).toFixed(1)}%
                      </div>
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
