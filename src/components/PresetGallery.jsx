import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import GlassCard from './GlassCard';
import { PRESET_GALLERY } from '../data/samplePresets';
import { MARD_MAP } from '../data/mardPalette';

export default function PresetGallery({ isOpen, onClose, onSelectPreset }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-studio-in">
      <div className="w-full max-w-xl">
        <GlassCard className="p-6 border border-stone-300 shadow-xl relative bg-white">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  精选经典拼豆模板
                </h2>
                <p className="text-xs text-stone-400">
                  标准 MARD-221 色卡图纸，一键载入即可编辑与导出
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-5">
            {PRESET_GALLERY.map((preset) => {
              const previewSize = 72;
              const cellPx = previewSize / Math.max(preset.width, preset.height);

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className="group p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-400 cursor-pointer transition-all flex flex-col items-center text-center"
                >
                  <div
                    style={{ width: previewSize, height: previewSize }}
                    className="rounded-lg bg-white p-1 border border-stone-200 mb-2.5 flex items-center justify-center overflow-hidden shadow-inner"
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${preset.width}, ${cellPx}px)`,
                        gridTemplateRows: `repeat(${preset.height}, ${cellPx}px)`,
                      }}
                    >
                      {preset.grid.flatMap((row, r) =>
                        row.map((code, c) => {
                          const hex = code && code !== 'EMPTY' ? MARD_MAP.get(code)?.hex || '#888' : 'transparent';
                          return (
                            <div
                              key={`${r}-${c}`}
                              style={{ backgroundColor: hex }}
                              className="w-full h-full"
                            />
                          );
                        })
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900 mb-1">
                    {preset.name}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {preset.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-stone-200/60 text-stone-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-stone-900 font-medium flex items-center gap-1 mt-auto">
                    载入图纸 <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-200">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors"
            >
              取消
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
