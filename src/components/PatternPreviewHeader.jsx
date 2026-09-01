import React from 'react';
import { RefreshCw, Printer, Download, Cloud, Check, SplitSquareVertical } from 'lucide-react';

export default function PatternPreviewHeader({
  patternName,
  onPatternNameChange,
  showColorCodes,
  onToggleColorCodes,
  showRulers,
  onToggleRulers,
  compareMode,
  onToggleCompareMode,
  onReset,
  onPrint,
  onDownloadPng,
  onExportBom,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border-b border-stone-200 text-xs">
      {/* 左侧标题与复选开关 */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-bold text-stone-900">图纸预览</h2>

        {/* 色号标签复选 */}
        <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
          <input
            type="checkbox"
            checked={showColorCodes}
            onChange={onToggleColorCodes}
            className="rounded border-stone-300 text-stone-900 focus:ring-0 accent-stone-900 cursor-pointer"
          />
          <span className="font-medium text-xs">色号标签</span>
        </label>

        {/* 行列编号复选 */}
        <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
          <input
            type="checkbox"
            checked={showRulers}
            onChange={onToggleRulers}
            className="rounded border-stone-300 text-stone-900 focus:ring-0 accent-stone-900 cursor-pointer"
          />
          <span className="font-medium text-xs">行列编号</span>
        </label>

        {/* 卷帘对比复选 */}
        <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={onToggleCompareMode}
            className="rounded border-stone-300 text-stone-900 focus:ring-0 accent-stone-900 cursor-pointer"
          />
          <span className="font-medium text-xs flex items-center gap-1">
            <SplitSquareVertical className="w-3 h-3 text-amber-500" />
            卷帘对比
          </span>
        </label>

        {/* 图纸重命名输入框 */}
        <input
          type="text"
          value={patternName}
          onChange={(e) => onPatternNameChange(e.target.value)}
          placeholder="未命名图纸"
          className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 font-medium text-xs focus:outline-none focus:border-stone-900 min-w-[170px]"
        />
      </div>

      {/* 右侧动作按钮栏 (对齐竞品精致按钮风格) */}
      <div className="flex items-center gap-2">
        {/* 重置 */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-medium transition-colors"
          title="清空或重置画布"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
          <span>重置</span>
        </button>

        {/* 打印 */}
        <button
          onClick={onPrint}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-medium transition-colors"
          title="直接调用系统打印机打印"
        >
          <Printer className="w-3.5 h-3.5 text-stone-500" />
          <span>打印</span>
        </button>

        {/* 下载 PNG (对齐竞品蓝色主按钮) */}
        <button
          onClick={onDownloadPng}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>下载 PNG</span>
        </button>

        {/* 保存到云端 / 导出 BOM (对齐竞品琥珀色按钮) */}
        <button
          onClick={onExportBom}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm transition-colors"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>导出物料 BOM</span>
        </button>
      </div>
    </div>
  );
}
