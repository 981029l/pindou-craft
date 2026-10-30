import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Palette,
  Sun,
  Contrast,
  Droplets
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' (规格与插板) | 'color' (调色与滤镜)

  const PALETTE_BRAND_OPTIONS = [
    { value: 'MARD', label: 'MARD (迈阿德 221色标准)' },
    { value: 'PERLER', label: 'Perler (拼拼豆豆 80色标准)' },
    { value: 'ARTKAL', label: 'Artkal (阿卡尔 160色系列)' },
  ];

  return (
    <GlassCard className="p-4 sm:p-5 border border-stone-200 shadow-sm bg-white space-y-3.5 overflow-visible relative z-10">
      {/* 标题与分栏切换 */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-stone-100 border border-stone-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'grid'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>插板规格</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'color'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>调色与滤镜</span>
          </button>
        </div>

        {activeTab === 'color' && (
          <button
            onClick={onResetFilters}
            className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-stone-50"
            title="重置滤镜参数"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置</span>
          </button>
        )}
      </div>

      {/* 分栏 1: 插板规格与品牌 */}
      {activeTab === 'grid' && (
        <div className="space-y-3.5 animate-studio-in">
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

          {/* 网格尺寸 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                网格尺寸 (宽 × 高)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onAutoDetectDensity}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold transition-colors"
                  title="智能探测图片像素块大小并自动对齐网格"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>自动探测密度</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleKeepAspectRatio}
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    keepAspectRatio ? 'text-amber-600' : 'text-stone-400'
                  }`}
                >
                  {keepAspectRatio ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
                  <span>比例锁定</span>
                </button>
              </div>
            </div>

            {/* 快捷规格标签 */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[
                { label: '50 标准板', w: 50, h: 50 },
                { label: '100 双拼板', w: 100, h: 100 },
                { label: '160 超清板', w: 160, h: 160 },
                { label: '220 巨幕板', w: 220, h: 220 },
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
                className="col-span-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-center text-xs font-bold focus:outline-none focus:border-stone-900 shadow-2xs"
              />
              <span className="col-span-1 text-center text-stone-400 font-bold text-xs">×</span>
              <input
                type="number"
                min="10"
                value={gridHeight}
                onChange={(e) => onGridSizeChange(Math.max(10, Number(e.target.value) || 10), 'height')}
                className="col-span-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-center text-xs font-bold focus:outline-none focus:border-stone-900 shadow-2xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 分栏 2: 调色与滤镜 */}
      {activeTab === 'color' && (
        <div className="space-y-3.5 animate-studio-in">
          {/* 色彩保真度与色数控制 (默认全色谱无损) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">色彩保真度：</span>
              <button
                type="button"
                onClick={onToggleColorLimit}
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                  !enableColorLimit
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-300'
                }`}
              >
                {!enableColorLimit ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>全色谱 100% 直通</span>
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
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>已启用 {paletteBrand} 全色系自然匹配</span>
                </span>
                <span className="font-semibold text-emerald-700">细腻微调</span>
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
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-stone-400" />
                  <span>亮度 (Brightness)</span>
                </span>
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
                <span className="flex items-center gap-1">
                  <Contrast className="w-3 h-3 text-stone-400" />
                  <span>对比度 (Contrast)</span>
                </span>
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
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-stone-400" />
                  <span>饱和度 (Saturation)</span>
                </span>
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
        </div>
      )}
    </GlassCard>
  );
}
