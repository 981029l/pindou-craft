import React from 'react';
import { Settings, Download, RefreshCw } from 'lucide-react';
import DitherGradient from './ui/DitherGradient';
import TextMorph from './ui/TextMorph';

export default function Navbar({ onOpenSettings, onOpenExport, onReset, hasApiKey }) { // # 顶部导航组件
  return (
    <header className="sticky top-0 z-30 w-full px-3 sm:px-8 py-2.5 sm:py-3 bg-white/90 backdrop-blur-md border-b border-stone-200/90 shadow-xs relative overflow-hidden">
      {/* 极轻量复古 Bayer 抖动渐变底层 (来自 Componentry DitherGradient 风格) */}
      <DitherGradient
        colorFrom="#4f46e5"
        colorMid="#7c3aed"
        colorTo="#ec4899"
        intensity={0.06}
        speed={0.8}
        className="opacity-10 pointer-events-none"
      />

      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4 relative z-10">
        {/* 左侧品牌与工坊标识 */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 flex items-center justify-center shadow-xs shrink-0 ring-1 ring-white/20">
            <div className="grid grid-cols-2 gap-1 p-1 sm:p-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#f87171]" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#fbbf24]" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38bdf8]" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#4ade80]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <h1 className="text-sm sm:text-lg font-bold text-stone-900 font-display tracking-tight truncate">
                PinDou Atelier
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100/90 backdrop-blur-sm text-stone-700 border border-stone-200 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                拼豆手作工坊
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 font-normal">
              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono">LIVE ATELIER</span>
              <span className="text-stone-300">·</span>
              <TextMorph
                words={[
                  "MARD 221 / Perler / Artkal 全色谱高保真匹配",
                  "AI 智能图纸重构 · 毫秒级颜色量化映射",
                  "1:1 实体尺寸对位 · 工业级物料 BOM 耗材清单",
                  "手工拼豆实体打卡进度追踪 · 高保真微珠光泽",
                  "零裁切无损直通 · 支持 2.6mm/5.0mm 双规制"
                ]}
                interval={3600}
                className="text-stone-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 右侧功能操作区 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* AI 状态指示 */}
          <button 
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50/90 backdrop-blur-sm border border-stone-200 hover:border-stone-400 transition-colors text-xs text-stone-600 shadow-2xs"
            title="点击配置自定义 AI 端点与密钥"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${hasApiKey ? 'bg-emerald-400' : 'bg-stone-300'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasApiKey ? 'bg-emerald-500' : 'bg-stone-400'}`} />
            </span>
            <span className="font-medium">AI: {hasApiKey ? '已连接' : '未配置 (点击设置)'}</span>
          </button>

          {/* 设置按钮 */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
            title="自定义 AI 服务端点与 Key"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 清空重置 */}
          <button
            onClick={onReset}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200 text-stone-500 hover:text-rose-600 transition-colors shadow-2xs"
            title="清空画布"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* 导出图纸主按键 */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">导出图纸 & BOM</span>
            <span className="sm:hidden font-medium">导出</span>
          </button>
        </div>
      </div>
    </header>
  );
}
