import React, { useEffect, useState, useRef } from 'react';

/**
 * SplitFlapDigit: 单个机械翻牌槽位
 */
function SplitFlapDigit({ char = ' ', prevChar = ' ', isFlipping = false }) {
  return (
    <div className="relative inline-flex flex-col items-center justify-center w-5 h-7 sm:w-6 sm:h-8 bg-stone-900 text-amber-300 font-mono text-xs sm:text-sm font-black rounded-[4px] shadow-sm select-none border border-stone-800 overflow-hidden perspective-[300px]">
      {/* 静态文字基底 */}
      <span className="z-0 tracking-wider">{char}</span>

      {/* 居中横向分割槽缝 (典型机场翻牌机特征) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/80 z-20 shadow-xs pointer-events-none" />

      {/* 上半部分折光高光 */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

      {/* 下半部分暗部阴影 */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-black/25 pointer-events-none z-10" />

      {/* 翻牌动效遮罩 */}
      {isFlipping && (
        <div 
          className="absolute inset-0 bg-stone-950/40 z-30 animate-pulse pointer-events-none" 
        />
      )}
    </div>
  );
}

/**
 * SplitFlapDisplay
 * 来自 Componentry (https://componentry.dev/components/split-flap-display)
 * 工业复古机械翻牌屏
 */
export default function SplitFlapDisplay({
  value = '0',
  label = '',
  minLength = 4,
  className = '',
  accentColor = '#f59e0b',
}) {
  const strVal = String(value).padStart(minLength, ' ');
  const [displayedStr, setDisplayedStr] = useState(strVal);
  const [flippingIndices, setFlippingIndices] = useState(new Set());
  const prevValRef = useRef(strVal);

  useEffect(() => {
    if (strVal === prevValRef.current) return;
    const oldStr = prevValRef.current;
    prevValRef.current = strVal;

    // 找出变动的位
    const diffs = new Set();
    for (let i = 0; i < strVal.length; i++) {
      if (strVal[i] !== oldStr[i]) {
        diffs.add(i);
      }
    }

    setFlippingIndices(diffs);
    setDisplayedStr(strVal);

    const timer = setTimeout(() => {
      setFlippingIndices(new Set());
    }, 400);

    return () => clearTimeout(timer);
  }, [strVal]);

  return (
    <div className={`inline-flex flex-col items-start gap-1 p-2 rounded-xl bg-stone-950/90 border border-stone-800 shadow-inner backdrop-blur-md ${className}`}>
      {label && (
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">
            {label}
          </span>
          <span 
            className="w-1.5 h-1.5 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {displayedStr.split('').map((ch, idx) => (
          <SplitFlapDigit
            key={idx}
            char={ch}
            isFlipping={flippingIndices.has(idx)}
          />
        ))}
      </div>
    </div>
  );
}
