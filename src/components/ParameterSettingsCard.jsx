import React from 'react';
import { Settings, Lock, Unlock, RotateCcw, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import GlassCard from './GlassCard';
import CustomDropdown from './CustomDropdown';

export default function ParameterSettingsCard({
  gridWidth,
  gridHeight,
  onGridSizeChange,
  onApplyPresetSize,
  onAutoDetectDensity,
  keepAspectRatio,
  onToggleKeepAspectRatio,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  saturation,
  onSaturationChange,
  enableColorLimit,
  onToggleColorLimit,
  maxColors,
  onMaxColorsChange,
  paletteBrand = 'MARD',
  onPaletteBrandChange,
  onResetFilters,
}) {
  const PALETTE_BRAND_OPTIONS = [
    { value: 'MARD', label: 'MARD (迈阿德 221色标准)' },
    { value: 'PERLER', label: 'Perler (拼拼豆豆 80色标准)' },
    { value: 'ARTKAL', label: 'Artkal (阿卡尔 160色系列)' },
  ];

  return (
    <GlassCard className="p-4 sm:p-5 border border-stone-200 shadow-sm bg-white space-y-4 overflow-visible relative z-10">
      {/* 标题 */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2 text-stone-900">
          <span className="text-amber-500">
            <Settings className="w-4 h-4" />
          </span>
          <h2 className="text-sm font-bold">参数设置</h2>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors"
          title="重置滤镜参数"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置滤镜</span>
        </button>
      </div>

      {/* 色板品牌选择 */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
          色板品牌
        </label>
        <CustomDropdown
          options={PALETTE_BRAND_OPTIONS}
          value={paletteBrand}
          onChange={(v) => onPaletteBrandChange && onPaletteBrandChange(v)}
        />
      </div>

      {/* 网格尺寸 (无上限) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
            <span>网格尺寸 (宽 × 高)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={onAutoDetectDensity}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold transition-colors"
              title="智能探测 AI 图片物理豆子密度并自动对齐"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>AI 自动探测密度</span>
            </button>

            <button
              onClick={onToggleKeepAspectRatio}
              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                keepAspectRatio ? 'text-amber-600' : 'text-stone-400'
              }`}
            >
              {keepAspectRatio ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
              <span>保持比例</span>
            </button>
          </div>
        </div>

        {/* 快捷规格标签 */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {[
            { label: '100 标准', w: 100, h: 100 },
            { label: '150 超清', w: 150, h: 150 },
            { label: '200 巨幕', w: 200, h: 200 },
            { label: '260 典藏', w: 260, h: 260 },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onApplyPresetSize(preset.w, preset.h)}
              className={`py-1 rounded-lg text-[10px] font-medium border transition-colors text-center ${
                gridWidth === preset.w && gridHeight === preset.h
                  ? 'bg-stone-900 text-white border-stone-900 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 items-center">
          <input
            type="number"
            min="10"
            value={gridWidth}
            onChange={(e) => onGridSizeChange(Math.max(10, Number(e.target.value) || 10), 'width')}
            className="col-span-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-center text-xs font-bold focus:outline-none focus:border-stone-900 shadow-sm"
          />
          <span className="col-span-1 text-center text-stone-400 font-bold text-xs">×</span>
          <input
            type="number"
            min="10"
            value={gridHeight}
            onChange={(e) => onGridSizeChange(Math.max(10, Number(e.target.value) || 10), 'height')}
            className="col-span-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-center text-xs font-bold focus:outline-none focus:border-stone-900 shadow-sm"
          />
        </div>
      </div>

      {/* 色彩保真度与色数控制 (默认全色谱无损) */}
      <div className="pt-2 border-t border-stone-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-700">色彩保真度：</span>
          <button
            type="button"
            onClick={onToggleColorLimit}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
              !enableColorLimit
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-stone-100 text-stone-600 border-stone-300'
            }`}
          >
            {!enableColorLimit ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>全色谱 100% 无损直通</span>
              </>
            ) : (
              <>
                <Sliders className="w-3 h-3 text-stone-500" />
                <span>自定义限制色数</span>
              </>
            )}
          </button>
        </div>

        {!enableColorLimit ? (
          <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
            <span>✨ 已启用 {paletteBrand} 全色系自然匹配</span>
            <span className="font-semibold text-emerald-700">层次最丰富 · 零压缩</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 animate-studio-in">
            <div className="flex justify-between text-stone-600 text-xs">
              <span>最大限制色数：</span>
              <span className="font-mono text-stone-900 font-bold">{maxColors} 色</span>
            </div>
            <input
              type="range"
              min="12"
              max="160"
              value={maxColors}
              onChange={(e) => onMaxColorsChange(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
            />
          </div>
        )}
      </div>

      {/* 实时图像滤镜调谐滑块 */}
      <div className="space-y-3 pt-2 border-t border-stone-100 text-xs">
        <div>
          <div className="flex justify-between text-stone-600 mb-1">
            <span>亮度 (Brightness)</span>
            <span className="font-mono text-stone-900 font-semibold">{brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => onBrightnessChange(Number(e.target.value))}
            className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-stone-600 mb-1">
            <span>对比度 (Contrast)</span>
            <span className="font-mono text-stone-900 font-semibold">{contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={contrast}
            onChange={(e) => onContrastChange(Number(e.target.value))}
            className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-stone-600 mb-1">
            <span>饱和度 (Saturation)</span>
            <span className="font-mono text-stone-900 font-semibold">{saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={saturation}
            onChange={(e) => onSaturationChange(Number(e.target.value))}
            className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
          />
        </div>
      </div>
    </GlassCard>
  );
}
