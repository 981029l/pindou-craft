import React from 'react';
import { Printer, Download, Cloud, Check, SplitSquareVertical } from 'lucide-react';

export default function PatternPreviewHeader({ // # 图纸预览控制头部组件 (零滑动自适应版)
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-3.5 bg-white border-b border-stone-200 text-xs shrink-0 select-none">
      {/* 选项与标题区 (移动端自适应满宽，绝无横向滑动) */}
      <div className="flex items-center justify-between gap-1.5 w-full sm:w-auto">
        {/* 图纸重命名输入框 */}
        <input
          type="text"
          value={patternName}
          onChange={(e) => onPatternNameChange(e.target.value)}
          placeholder="未命名图纸"
          className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 font-medium text-xs focus:outline-none focus:border-stone-900 flex-1 sm:flex-initial sm:min-w-[140px] sm:max-w-[180px] min-w-0 truncate"
        />

        {/* 视图开关组 (移动端紧凑胶囊按钮) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleColorCodes}
            className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
              showColorCodes
                ? 'bg-stone-900 text-white border-stone-900 font-bold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="显示/隐藏色号代码"
          >
            色号
          </button>

          <button
            type="button"
            onClick={onToggleRulers}
            className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
              showRulers
                ? 'bg-stone-900 text-white border-stone-900 font-bold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="显示/隐藏坐标刻度"
          >
            刻度
          </button>

          <button
            type="button"
            onClick={onToggleCompareMode}
            className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-medium transition-colors border flex items-center gap-0.5 ${
              compareMode
                ? 'bg-amber-500 text-white border-amber-500 font-bold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="开启/关闭原图卷帘对比"
          >
            <SplitSquareVertical className="w-3 h-3" />
            <span>卷帘</span>
          </button>
        </div>
      </div>

      {/* 右侧动作按钮栏 (移动端 2 等分整齐平铺，零滑动) */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">

        {/* 下载 PNG */}
        <button
          onClick={onDownloadPng}
          className="flex items-center justify-center gap-1 py-1.5 px-2 sm:px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors text-xs"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">下载 PNG</span>
        </button>

        {/* 导出 BOM */}
        <button
          onClick={onExportBom}
          className="flex items-center justify-center gap-1 py-1.5 px-2 sm:px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-xs transition-colors text-xs"
        >
          <Cloud className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">导出物料</span>
        </button>

        {/* 打印 (仅在平板/桌面展示) */}
        <button
          onClick={onPrint}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-medium transition-colors text-xs shrink-0"
          title="直接调用系统打印机打印"
        >
          <Printer className="w-3.5 h-3.5 text-stone-500" />
          <span>打印</span>
        </button>
      </div>
    </div>
  );
}
