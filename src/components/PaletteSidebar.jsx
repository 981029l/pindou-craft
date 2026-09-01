import React, { useState, useMemo } from 'react';
import { Palette, Search, Check, Lightbulb, Package } from 'lucide-react';
import GlassCard from './GlassCard';
import { MARD_PALETTE, MARD_MAP } from '../data/mardPalette';

export default function PaletteSidebar({
  gridData,
  selectedColorCode,
  onSelectColorCode,
  highlightColorCode,
  onToggleHighlight,
}) {
  const [activeTab, setActiveTab] = useState('bom'); // 'bom' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('ALL');

  // 计算当前图案中使用的色号频次与统计 (BOM)
  const bomStats = useMemo(() => {
    if (!gridData || gridData.length === 0) return [];
    const countMap = new Map();
    let totalBeads = 0;

    for (let r = 0; r < gridData.length; r++) {
      for (let c = 0; c < gridData[r].length; c++) {
        const code = gridData[r][c];
        if (code && code !== 'EMPTY') {
          countMap.set(code, (countMap.get(code) || 0) + 1);
          totalBeads++;
        }
      }
    }

    return Array.from(countMap.entries())
      .map(([code, count]) => {
        const item = MARD_MAP.get(code) || { name_zh: '未知', hex: '#888888', series: '?' };
        return {
          code,
          count,
          percentage: totalBeads > 0 ? ((count / totalBeads) * 100).toFixed(1) : 0,
          ...item,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [gridData]);

  const SERIES_LIST = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

  const filteredPalette = useMemo(() => {
    return MARD_PALETTE.filter(item => {
      const matchSeries = selectedSeries === 'ALL' || item.series === selectedSeries;
      const matchQuery = !searchQuery || 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name_zh.includes(searchQuery);
      return matchSeries && matchQuery;
    });
  }, [selectedSeries, searchQuery]);

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden border border-stone-200 shadow-sm">
      {/* 顶部 Tab 切换 (日系工坊分格收纳抽屉) */}
      <div className="p-2.5 border-b border-stone-200 bg-stone-50/70">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-200/60">
          <button
            onClick={() => setActiveTab('bom')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bom'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>已用色号 ({bomStats.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>MARD 221 色卡</span>
          </button>
        </div>
      </div>

      {/* Tab 1: 已用色号清单 (BOM) */}
      {activeTab === 'bom' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2 px-1">
            <span>色号 / 名称</span>
            <div className="flex items-center gap-3">
              <span>颗数</span>
              <span>高亮找色</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {bomStats.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                画布目前为空，请创作或载入图案
              </div>
            ) : (
              bomStats.map((item) => {
                const isSelected = selectedColorCode === item.code;
                const isHighlighted = highlightColorCode === item.code;

                return (
                  <div
                    key={item.code}
                    onClick={() => onSelectColorCode(item.code)}
                    className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-100 border-stone-900 shadow-sm ring-1 ring-stone-900'
                        : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {/* 左侧色块与名称 */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full border border-black/10 shadow-sm flex items-center justify-center text-[9px] font-mono font-bold"
                        style={{ backgroundColor: item.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 drop-shadow-sm" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-stone-900">{item.code}</span>
                          <span className="text-[11px] text-stone-600 font-medium">{item.name_zh}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {item.hex} · {item.percentage}%
                        </div>
                      </div>
                    </div>

                    {/* 右侧颗数与高亮找色 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 font-mono">
                        {item.count} <span className="text-[10px] text-stone-400 font-normal">颗</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHighlight(item.code);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isHighlighted
                            ? 'bg-amber-400 border-amber-500 text-stone-950 shadow-sm'
                            : 'bg-stone-100 border-stone-200 text-stone-500 hover:text-amber-600 hover:border-amber-400'
                        }`}
                        title={isHighlighted ? '取消同色高亮' : '高亮画布中该色号 (拼豆快速找色)'}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 全量 MARD 221 色卡库 */}
      {activeTab === 'all' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-2.5">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索色号 (如 A1) 或 名称..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          {/* 系列标签栏 */}
          <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
            {SERIES_LIST.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSeries(s)}
                className={`px-2 py-0.5 rounded-md border font-medium transition-colors ${
                  selectedSeries === s
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                {s === 'ALL' ? '全部' : `${s}系`}
              </button>
            ))}
          </div>

          {/* 色卡抽屉网格 */}
          <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 pr-1 custom-scrollbar">
            {filteredPalette.map((item) => {
              const isSelected = selectedColorCode === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => onSelectColorCode(item.code)}
                  className={`group relative flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-stone-100 border-stone-900 ring-1 ring-stone-900 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                  title={`${item.code} - ${item.name_zh} (${item.hex})`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm mb-1"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="text-[10px] font-mono font-bold text-stone-800">{item.code}</span>
                  <span className="text-[9px] text-stone-500 truncate max-w-[42px]">{item.name_zh}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
