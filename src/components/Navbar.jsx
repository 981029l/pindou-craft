import React from 'react';
import { 
  Settings, 
  Download, 
  RotateCcw, 
  FileText, 
  LayoutGrid, 
  SplitSquareVertical, 
  Undo2, 
  Redo2, 
  Printer 
} from 'lucide-react';
import DitherGradient from './ui/DitherGradient';

/**
 * Google Stitch 风格: 顶部全局导航栏 (Top App Bar)
 * 高度 48px (h-12)，集成品牌、图纸命名、模式切换、撤销重做与导出中心
 */
export default function Navbar({
  patternName = '拼豆图纸 - 超清全色谱',
  onPatternNameChange,
  compareMode = false,
  onToggleCompareMode,
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  onOpenSettings,
  onOpenExport,
  onReset,
  onPrint,
  hasApiKey = false
}) {
  return (
    <header className="h-12 w-full px-3 sm:px-4 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs relative z-30 shrink-0 flex items-center justify-between gap-3 select-none">
      {/* 极轻量底纹 */}
      <DitherGradient
        colorFrom="#4f46e5"
        colorMid="#7c3aed"
        colorTo="#ec4899"
        intensity={0.04}
        speed={0.8}
        className="opacity-10 pointer-events-none"
      />

      {/* 左侧：品牌与图纸命名面包屑 */}
      <div className="flex items-center gap-3 min-w-0 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs ring-1 ring-black/5">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/90 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white" />
            </span>
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-stone-900 hidden sm:inline">
            BeadCraft Studio
          </span>
        </div>

        <div className="h-4 w-px bg-stone-200 hidden sm:block shrink-0" />

        {/* 图纸名称输入框 */}
        <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/70 transition-colors max-w-[200px] sm:max-w-[240px]">
          <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            className="bg-transparent border-none p-0 text-stone-800 text-xs font-mono font-medium focus:outline-hidden w-full truncate"
            type="text"
            value={patternName}
            onChange={(e) => onPatternNameChange && onPatternNameChange(e.target.value)}
            placeholder="输入图纸名称..."
          />
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="已就绪 · 本地实时同步" />
        </div>
      </div>

      {/* 中部：视口模式切换与历史撤销重做 (桌面端) */}
      <div className="hidden md:flex items-center gap-3 z-10">
        {/* 模式切换器 */}
        <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200/60">
          <button
            type="button"
            onClick={() => compareMode && onToggleCompareMode && onToggleCompareMode()}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !compareMode
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>拼豆图纸模式</span>
          </button>
          <button
            type="button"
            onClick={() => !compareMode && onToggleCompareMode && onToggleCompareMode()}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              compareMode
                ? 'bg-white text-rose-600 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>原图对比卷帘</span>
          </button>
        </div>

        <div className="h-4 w-px bg-stone-200" />

        {/* 撤销 / 重做 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg border transition-all ${
              canUndo
                ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 shadow-2xs'
                : 'border-transparent text-stone-300 cursor-not-allowed'
            }`}
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg border transition-all ${
              canRedo
                ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 shadow-2xs'
                : 'border-transparent text-stone-300 cursor-not-allowed'
            }`}
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 右侧：重置、打印与主导出按钮 */}
      <div className="flex items-center gap-1.5 sm:gap-2 z-10 shrink-0">
        {/* 重置画布 */}
        <button
          type="button"
          onClick={onReset}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-stone-200 bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors text-xs font-medium flex items-center gap-1 shadow-2xs active:scale-95"
          title="清空画布上所有豆子"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">重置</span>
        </button>

        {/* 打印 */}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors text-xs font-medium shadow-2xs active:scale-95"
            title="直接调用浏览器高精打印"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>打印</span>
          </button>
        )}

        {/* AI 配置状态 */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-2xs active:scale-95"
          title="配置 AI 端点与密钥"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* 主导出按钮 (Stitch 标志性浆果红) */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出图纸 & BOM</span>
        </button>
      </div>
    </header>
  );
}
