import React from 'react';
import { Settings, Download, RefreshCw } from 'lucide-react';

export default function Navbar({ onOpenSettings, onOpenExport, onReset, hasApiKey }) { // # 顶部导航组件
  return (
    <header className="sticky top-0 z-30 w-full px-3 sm:px-8 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* 左侧品牌与工坊标识 */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 flex items-center justify-center shadow-xs shrink-0">
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
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                拼豆手作工坊
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden lg:block font-normal truncate">
              MARD 221 / Perler / Artkal 全色谱 · AI 智能图纸重构 · 实体工匠工作台
            </p>
          </div>
        </div>

        {/* 右侧功能操作区 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* AI 状态指示 */}
          <button 
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-400 transition-colors text-xs text-stone-600"
            title="点击配置自定义 AI 端点与密钥"
          >
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-stone-300'}`} />
            <span>AI: {hasApiKey ? '已连接' : '未配置 (点击设置)'}</span>
          </button>

          {/* 设置按钮 */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
            title="自定义 AI 服务端点与 Key"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 清空重置 */}
          <button
            onClick={onReset}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200 text-stone-500 hover:text-rose-600 transition-colors"
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
