import React from 'react';
import { 
  Upload, 
  Pipette, 
  Pencil, 
  PaintBucket, 
  Eraser, 
  Hand, 
  Circle,
  Square,
  Shrink,
  Layers
} from 'lucide-react';

/**
 * Google Stitch 风格: 左侧 56px 极简垂直工具轨 (Left Tool Rail)
 * 释放画布横向与纵向面积，提供高频绘图与视图工具
 */
export default function LeftToolRail({
  currentTool = 'pencil',
  onSelectTool,
  onUploadClick,
  showGridLines,
  onToggleGridLines,
  showRulers,
  onToggleRulers,
  beadStyle = 'bead',
  onBeadStyleChange,
  className = ''
}) {
  const tools = [
    { id: 'upload', label: '原图', icon: Upload, onClick: onUploadClick, title: '导入或更换原图' },
    { id: 'picker', label: '吸管', icon: Pipette, onClick: () => onSelectTool('picker'), title: '吸管取色 (快捷键: I)' },
    { id: 'pencil', label: '铅笔', icon: Pencil, onClick: () => onSelectTool('pencil'), title: '铅笔绘制 (快捷键: B)' },
    { id: 'bucket', label: '填色', icon: PaintBucket, onClick: () => onSelectTool('bucket'), title: '油漆桶连续填充 (快捷键: G)' },
    { id: 'eraser', label: '橡皮', icon: Eraser, onClick: () => onSelectTool('eraser'), title: '橡皮擦除 (快捷键: E)' },
    { id: 'hand', label: '抓手', icon: Hand, onClick: () => onSelectTool('hand'), title: '抓手平移画布 (快捷键: Space)' },
  ];

  return (
    <aside className={`w-14 shrink-0 bg-white border-r border-stone-200/90 flex flex-col items-center py-2.5 justify-between z-20 select-none ${className}`}>
      {/* 顶部主绘图工具组 */}
      <div className="flex flex-col items-center space-y-1.5 w-full px-1.5">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = currentTool === t.id && t.id !== 'upload';

          return (
            <button
              key={t.id}
              type="button"
              onClick={t.onClick}
              title={t.title}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl transition-all duration-150 active:scale-95 group relative ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[9px] leading-tight mt-0.5 scale-90">{t.label}</span>
              {isActive && (
                <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-3 rounded-l-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* 底部视图与质感开关组 */}
      <div className="flex flex-col items-center space-y-2 w-full px-1.5 pt-2.5 border-t border-stone-100">
        {/* 标尺切换 */}
        <button
          type="button"
          onClick={onToggleRulers}
          title={showRulers ? '隐藏外侧坐标标尺' : '显示外侧坐标标尺'}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-xs ${
            showRulers
              ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-2xs'
              : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          <span className="font-mono text-[10px] font-bold">XY</span>
        </button>

        {/* 珠体质感循环切换 */}
        <button
          type="button"
          onClick={() => {
            const next = beadStyle === 'bead' ? 'pixel' : beadStyle === 'pixel' ? 'punch' : 'bead';
            if (onBeadStyleChange) onBeadStyleChange(next);
          }}
          title={`当前质感: ${beadStyle === 'bead' ? '立体微珠' : beadStyle === 'pixel' ? '纯平像素' : '打孔效果'} (点击切换)`}
          className="w-9 h-9 flex flex-col items-center justify-center rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          {beadStyle === 'bead' && <Circle className="w-4 h-4 fill-amber-400 text-amber-500" />}
          {beadStyle === 'pixel' && <Square className="w-4 h-4 fill-stone-700 text-stone-900" />}
          {beadStyle === 'punch' && <Shrink className="w-4 h-4 text-emerald-600" />}
          <span className="text-[8px] text-stone-400 scale-90 mt-0.5">
            {beadStyle === 'bead' ? '微珠' : beadStyle === 'pixel' ? '像素' : '打孔'}
          </span>
        </button>
      </div>
    </aside>
  );
}
