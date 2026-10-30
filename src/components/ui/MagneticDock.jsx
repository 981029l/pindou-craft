import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * DockItemButton: 单个磁吸图标项
 */
function DockItemButton({
  mouseX,
  item,
  baseSize = 38,
  maxScale = 1.32,
  magneticDistance = 110,
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current ? ref.current.getBoundingClientRect() : { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(
    distance,
    [-magneticDistance, 0, magneticDistance],
    [baseSize, baseSize * maxScale, baseSize]
  );

  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });

  return (
    <div className="relative flex flex-col items-center">
      {/* 悬浮 Tooltip 标签 */}
      {isHovered && item.label && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: -6, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          className="absolute -top-8 px-2 py-0.5 rounded-md bg-stone-900/90 text-white text-[10px] font-medium tracking-wide shadow-md whitespace-nowrap pointer-events-none z-50 border border-stone-700/60"
        >
          {item.label}
        </motion.div>
      )}

      <motion.button
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={item.onClick}
        disabled={item.disabled}
        className={`relative flex items-center justify-center rounded-xl transition-colors duration-150 shadow-sm ${
          item.isActive
            ? 'bg-amber-400 text-stone-950 shadow-amber-500/20 shadow-md font-bold'
            : item.disabled
            ? 'opacity-30 cursor-not-allowed bg-stone-800/40 text-stone-500'
            : 'bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700/60 hover:border-stone-500'
        }`}
        type="button"
      >
        <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
          {item.icon}
        </span>

        {/* 激活指示小圆点 */}
        {item.isActive && (
          <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-amber-400 shadow-xs" />
        )}

        {/* 徽标 Badge */}
        {item.badge !== undefined && item.badge !== null && (
          <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
            {item.badge}
          </span>
        )}
      </motion.button>
    </div>
  );
}

/**
 * MagneticDock
 * 来自 Componentry (https://componentry.dev/components/magnetic-dock)
 * macOS 弹簧物理磁吸悬浮工具坞
 */
export default function MagneticDock({
  items = [],
  baseSize = 36,
  className = '',
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-stone-900/85 backdrop-blur-xl border border-stone-700/60 shadow-2xl ${className}`}
    >
      {items.map((item, idx) => {
        if (item.type === 'divider') {
          return (
            <div
              key={`div-${idx}`}
              className="w-[1px] h-5 bg-stone-700/70 mx-1 self-center"
            />
          );
        }
        return (
          <DockItemButton
            key={item.id || idx}
            mouseX={mouseX}
            item={item}
            baseSize={baseSize}
          />
        );
      })}
    </div>
  );
}
