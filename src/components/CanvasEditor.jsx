import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Pencil, 
  PaintBucket, 
  Pipette, 
  Eraser, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Circle, 
  Square, 
  Shrink,
  Sparkles
} from 'lucide-react';
import { getPaletteDataByBrand } from '../data/paletteManager';

export default function CanvasEditor({
  gridData,
  onGridChange,
  originalImageSrc,
  selectedColorCode,
  onSelectColorCode,
  highlightColorCode,
  paletteBrand = 'MARD',
  showGridLines = true,
  showColorCodes = true,
  showRulers = true,
  compareMode = false,
  undo,
  redo,
  canUndo,
  canRedo,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const origImgRef = useRef(null);

  const [currentTool, setCurrentTool] = useState('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // 默认采用【实心高光微珠 (gloss)】质感，彻底消除数万个小黑孔引发的灰雾干扰
  const [beadStyle, setBeadStyle] = useState('gloss'); // 'gloss' | 'pixel' | 'bead'

  const [curtainPos, setCurtainPos] = useState(50);
  const [isDraggingCurtain, setIsDraggingCurtain] = useState(false);

  const height = gridData?.length || 0;
  const width = gridData?.[0]?.length || 0;

  // 基础单格尺寸 (依据大网格自动适配基数)
  const maxDim = Math.max(width, height);
  const baseCellSize = maxDim >= 220 ? 6 : maxDim >= 150 ? 8 : maxDim >= 100 ? 10 : 14;
  const cellSize = Math.max(1.5, baseCellSize * zoom);
  const rulerOffset = showRulers ? 24 : 0;

  const { map: activeColorMap } = getPaletteDataByBrand(paletteBrand);

  // 严格自适应视口计算 (支持无限分辨率，确保整张图纸从头到尾 100% 完整可见)
  const fitToViewport = useCallback(() => {
    if (!containerRef.current || width === 0 || height === 0) return;
    const container = containerRef.current;

    const availW = container.clientWidth - 48;
    const availH = container.clientHeight - 48;

    const unscaledTotalW = width * baseCellSize + rulerOffset;
    const unscaledTotalH = height * baseCellSize + rulerOffset;

    if (availW <= 0 || availH <= 0 || unscaledTotalW <= 0 || unscaledTotalH <= 0) return;

    const fitScale = Math.min(availW / unscaledTotalW, availH / unscaledTotalH);
    const safeScale = Math.max(0.02, Math.min(3.5, Number(fitScale.toFixed(3))));

    setZoom(safeScale);
    setPan({ x: 0, y: 0 });
  }, [width, height, baseCellSize, rulerOffset]);

  useEffect(() => {
    fitToViewport();

    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      fitToViewport();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [width, height, fitToViewport]);

  useEffect(() => {
    if (!originalImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      origImgRef.current = img;
      renderCanvas();
    };
    img.src = originalImageSrc;
  }, [originalImageSrc]);

  // 核心 Canvas 渲染 (实心高光微珠高饱和质感)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext('2d');
    const totalWidth = width * cellSize + rulerOffset;
    const totalHeight = height * cellSize + rulerOffset;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    const gridPixelW = width * cellSize;
    const gridPixelH = height * cellSize;
    const curtainPixelX = rulerOffset + gridPixelW * (curtainPos / 100);

    // 1. 卷帘左侧原图
    if (compareMode && origImgRef.current) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rulerOffset, rulerOffset, curtainPixelX - rulerOffset, gridPixelH);
      ctx.clip();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rulerOffset, rulerOffset, curtainPixelX - rulerOffset, gridPixelH);
      ctx.drawImage(origImgRef.current, rulerOffset, rulerOffset, gridPixelW, gridPixelH);
      ctx.restore();
    }

    // 2. 右侧拼豆网格
    ctx.save();
    if (compareMode) {
      ctx.beginPath();
      ctx.rect(curtainPixelX, rulerOffset, totalWidth - curtainPixelX, gridPixelH);
      ctx.clip();
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(compareMode ? curtainPixelX : rulerOffset, rulerOffset, totalWidth, gridPixelH);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const code = gridData[y][x];
        const posX = rulerOffset + x * cellSize;
        const posY = rulerOffset + y * cellSize;

        if (compareMode && posX + cellSize < curtainPixelX) {
          continue;
        }

        const isTransparent = code === 'EMPTY' || !code;
        const colorItem = activeColorMap.get(code);
        const hex = colorItem ? colorItem.hex : '#cbd5e1';

        const isDimmed = highlightColorCode && code !== highlightColorCode && !isTransparent;

        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = 0.15;
        }

        if (isTransparent) {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#f8fafc' : '#f1f5f9';
          ctx.fillRect(posX, posY, cellSize, cellSize);

          const cx = posX + cellSize / 2;
          const cy = posY + cellSize / 2;
          const pegRadius = Math.max(0.5, cellSize * 0.12);

          ctx.beginPath();
          ctx.arc(cx, cy, pegRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fill();
        } 
        // 模式 1: 🔲 平面像素方块
        else if (beadStyle === 'pixel') {
          ctx.fillStyle = hex;
          ctx.fillRect(posX, posY, cellSize, cellSize);
        } 
        // 模式 2: ✨ 实心高光艺术微珠 (默认推荐，无孔洞灰雾，纯正色彩)
        else if (beadStyle === 'gloss') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(posX, posY, cellSize, cellSize);

          const cx = posX + cellSize / 2;
          const cy = posY + cellSize / 2;
          const radius = (cellSize / 2) * 0.94;

          // 饱满实体纯色圆珠
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = hex;
          ctx.fill();

          // 珠光左上角高光弧度 (细腻立体感，无任何黑孔干扰)
          if (cellSize >= 5) {
            ctx.beginPath();
            ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fill();

            // 边缘微反差勾边
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(0.4, cellSize * 0.04);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.stroke();
          }
        } 
        // 模式 3: ⭕ 经典孔洞拼豆
        else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(posX, posY, cellSize, cellSize);

          const cx = posX + cellSize / 2;
          const cy = posY + cellSize / 2;
          const radius = (cellSize / 2) * 0.90;
          const holeRadius = radius * 0.35;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = hex;
          ctx.fill();

          if (cellSize >= 10) {
            ctx.beginPath();
            ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#e2e8f0';
            ctx.fill();
          }
        }

        // 色号角标
        if (showColorCodes && !isTransparent && cellSize >= 16) {
          ctx.fillStyle = getContrastTextColor(hex);
          ctx.font = `700 ${Math.max(7, Math.floor(cellSize * 0.32))}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(code, posX + cellSize / 2, posY + cellSize / 2);
        }

        // 网格线
        if (showGridLines && cellSize >= 7) {
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(posX, posY, cellSize, cellSize);
        }

        ctx.restore();
      }
    }
    ctx.restore();

    // 3. 标尺
    if (showRulers) {
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, totalWidth, rulerOffset);
      ctx.fillRect(0, 0, rulerOffset, totalHeight);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rulerOffset, 0);
      ctx.lineTo(rulerOffset, totalHeight);
      ctx.moveTo(0, rulerOffset);
      ctx.lineTo(totalWidth, rulerOffset);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const step = maxDim >= 200 ? 20 : maxDim >= 100 ? 10 : 5;

      for (let x = 0; x < width; x++) {
        const posX = rulerOffset + x * cellSize + cellSize / 2;
        if (x % step === 0 || cellSize >= 22) {
          ctx.fillText((x + 1).toString(), posX, rulerOffset / 2);
        }
      }

      for (let y = 0; y < height; y++) {
        const posY = rulerOffset + y * cellSize + cellSize / 2;
        if (y % step === 0 || cellSize >= 22) {
          ctx.fillText((y + 1).toString(), rulerOffset / 2, posY);
        }
      }
    }

    // 4. 卷帘金黄线
    if (compareMode) {
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(curtainPixelX, rulerOffset);
      ctx.lineTo(curtainPixelX, totalHeight);
      ctx.stroke();
      ctx.restore();
    }
  }, [gridData, width, height, cellSize, rulerOffset, showRulers, showGridLines, showColorCodes, beadStyle, highlightColorCode, compareMode, curtainPos, activeColorMap, maxDim]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  function getContrastTextColor(hex) {
    if (!hex) return '#1e293b';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? '#0f172a' : '#ffffff';
  }

  const getGridCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.floor((clientX - rulerOffset) / cellSize);
    const y = Math.floor((clientY - rulerOffset) / cellSize);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      return { x, y };
    }
    return null;
  };

  const floodFill = (startX, startY, targetCode, replaceCode) => {
    if (targetCode === replaceCode) return gridData;
    const newGrid = gridData.map(row => [...row]);
    const queue = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const idx = y * width + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      if (newGrid[y][x] === targetCode) {
        newGrid[y][x] = replaceCode;
        if (x > 0 && newGrid[y][x - 1] === targetCode) queue.push([x - 1, y]);
        if (x < width - 1 && newGrid[y][x + 1] === targetCode) queue.push([x + 1, y]);
        if (y > 0 && newGrid[y - 1][x] === targetCode) queue.push([x, y - 1]);
        if (y < height - 1 && newGrid[y + 1][x] === targetCode) queue.push([x, y + 1]);
      }
    }
    return newGrid;
  };

  const handleCellAction = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    if (currentTool === 'picker') {
      const code = gridData[y][x];
      if (code && code !== 'EMPTY') {
        onSelectColorCode(code);
        setCurrentTool('pencil');
      }
      return;
    }

    if (currentTool === 'pencil') {
      if (gridData[y][x] !== selectedColorCode) {
        const newGrid = gridData.map(r => [...r]);
        newGrid[y][x] = selectedColorCode;
        onGridChange(newGrid);
      }
    } else if (currentTool === 'eraser') {
      if (gridData[y][x] !== 'EMPTY') {
        const newGrid = gridData.map(r => [...r]);
        newGrid[y][x] = 'EMPTY';
        onGridChange(newGrid);
      }
    } else if (currentTool === 'bucket') {
      const targetCode = gridData[y][x];
      const newGrid = floodFill(x, y, targetCode, selectedColorCode);
      onGridChange(newGrid);
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    setIsDrawing(true);
    const coords = getGridCoords(e);
    if (coords) handleCellAction(coords.x, coords.y);
  };

  const handleMouseMove = (e) => {
    if (isDraggingCurtain) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left - rulerOffset;
        const ratio = Math.max(0, Math.min(100, (clientX / (width * cellSize)) * 100));
        setCurtainPos(ratio);
      }
      return;
    }
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (isDrawing && (currentTool === 'pencil' || currentTool === 'eraser')) {
      const coords = getGridCoords(e);
      if (coords) handleCellAction(coords.x, coords.y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
    setIsDraggingCurtain(false);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom(prev => Math.min(4.0, Math.max(0.02, Number((prev + delta).toFixed(3)))));
    }
  };

  const activeColorInfo = activeColorMap.get(selectedColorCode);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-stone-200 shadow-sm select-none">
      {/* 辅助工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border-b border-stone-200 bg-stone-50/80 text-xs shrink-0">
        {/* 绘图主工具 */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
          <button
            onClick={() => setCurrentTool('pencil')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentTool === 'pencil' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="画笔 (单格着色)"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('bucket')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentTool === 'bucket' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="油漆桶 (泛洪填充)"
          >
            <PaintBucket className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('picker')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentTool === 'picker' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="吸管 (吸取色号)"
          >
            <Pipette className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentTool === 'eraser' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="橡皮擦 (清除透明)"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 撤销 / 重做 */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 种质感模式切换 (实心高光微珠 / 平面方块 / 经典打孔) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
          <button
            onClick={() => setBeadStyle('gloss')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
              beadStyle === 'gloss' ? 'bg-amber-500 text-white font-bold' : 'text-stone-600 hover:bg-stone-100'
            }`}
            title="实心高光微珠 (消除黑孔灰雾，高饱和超清)"
          >
            <Sparkles className="w-3 h-3" />
            <span>高光微珠</span>
          </button>

          <button
            onClick={() => setBeadStyle('pixel')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
              beadStyle === 'pixel' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600 hover:bg-stone-100'
            }`}
            title="平面像素方块"
          >
            <Square className="w-3 h-3" />
            <span>平面像素</span>
          </button>

          <button
            onClick={() => setBeadStyle('bead')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
              beadStyle === 'bead' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600 hover:bg-stone-100'
            }`}
            title="经典打孔拼豆"
          >
            <Circle className="w-3 h-3" />
            <span>打孔插板</span>
          </button>
        </div>

        {/* 视口缩放与自适应 */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-stone-200 shadow-sm">
          <button
            onClick={() => setZoom(prev => Math.max(0.02, Number((prev - 0.15).toFixed(3))))}
            className="p-1 text-stone-500 hover:text-stone-900"
            title="缩小"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-stone-600 min-w-[40px] text-center font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(4.0, Number((prev + 0.15).toFixed(3))))}
            className="p-1 text-stone-500 hover:text-stone-900"
            title="放大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={fitToViewport}
            className="flex items-center gap-1 px-2.5 py-1 ml-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold shadow-xs transition-colors"
            title="全图自适应完整铺满视口"
          >
            <Shrink className="w-3 h-3 text-stone-300" />
            <span>自适应全景</span>
          </button>

          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1 text-stone-400 hover:text-stone-800"
            title="100% 原始比例"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 核心工作台视口 (支持无限尺寸，居中完整呈现) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="relative flex-1 w-full overflow-auto bg-[#f1f3f2] flex items-center justify-center p-6 select-none cursor-crosshair custom-scrollbar"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.05s ease-out',
            width: width * cellSize + rulerOffset,
            height: height * cellSize + rulerOffset,
            margin: 'auto',
          }}
          className="relative shadow-2xl rounded-xl overflow-hidden border border-stone-300 bg-white shrink-0 my-auto"
        >
          <canvas ref={canvasRef} className="relative z-10 block" />

          {compareMode && (
            <div
              style={{ left: rulerOffset + (width * cellSize * (curtainPos / 100)) - 14 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingCurtain(true);
              }}
              className="absolute top-0 bottom-0 w-7 z-30 cursor-ew-resize flex items-center justify-center group pointer-events-auto"
            >
              <div className="w-0.5 h-full bg-amber-500 shadow-md group-hover:w-1 transition-all" />
              <div className="absolute w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white group-hover:scale-110 transition-transform">
                ⇔
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 shrink-0">
        <div className="flex items-center gap-3">
          <span>品牌：<strong className="text-stone-900">{paletteBrand}</strong></span>
          <span>规格：<strong className="text-stone-900 font-mono">{width} × {height} 格</strong></span>
          <span>总颗粒：<strong className="text-stone-900 font-mono">{width * height} 颗</strong></span>
          {compareMode && (
            <span className="text-amber-700 font-semibold">
              👈 左侧为原图 | 👉 右侧为拼豆（按住 ⇔ 拖动）
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>当前画笔：</span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white font-mono text-[11px] shadow-xs font-semibold"
            style={{ backgroundColor: activeColorInfo?.hex || '#18181b', color: getContrastTextColor(activeColorInfo?.hex) }}
          >
            {selectedColorCode} · {activeColorInfo?.name_zh || '选择颜色'}
          </span>
        </div>
      </div>
    </div>
  );
}
