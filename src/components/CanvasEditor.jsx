import React, { useRef, useEffect, useState, useCallback } from 'react'; // # React 核心与 Hooks
import { 
  Pencil, 
  PaintBucket, 
  Pipette, 
  Eraser, 
  Hand,
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Circle, 
  Square, 
  Shrink, 
  Sparkles, 
  Palette, 
  X,
  Crosshair,
  Lightbulb,
  Pin,
  Check,
  CheckCircle2,
  ArrowLeftRight,
  Printer,
  Download,
  Cloud,
  SplitSquareVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react'; // # 图标资源引用
import { getPaletteDataByBrand } from '../data/paletteManager'; // # 色卡数据管理器

export default function CanvasEditor({ // # 画布编辑器与竞品级用料矩阵工作台
  gridData,
  onGridChange,
  originalImageSrc,
  selectedColorCode,
  onSelectColorCode,
  highlightColorCode,
  onToggleHighlightColorCode,
  paletteBrand = 'MARD',
  showGridLines = true,
  showColorCodes = true,
  onToggleColorCodes,
  showRulers = false, // # 默认不选中刻度标尺
  onToggleRulers,
  compareMode = false,
  onToggleCompareMode,
  undo,
  redo,
  canUndo,
  canRedo,
  patternName,
  onPatternNameChange,
  onPrint,
  onDownloadPng,
  onExportBom,
  onReset,
  currentTool: propTool,
  onToolChange,
  beadStyle: propBeadStyle,
  onBeadStyleChange,
  onToggleGridLines,
}) {
  const [internalTool, setInternalTool] = useState('pencil');
  const currentTool = propTool !== undefined ? propTool : internalTool;
  const setCurrentTool = onToolChange || setInternalTool;

  const [internalBeadStyle, setInternalBeadStyle] = useState('gloss');
  const beadStyle = propBeadStyle !== undefined ? propBeadStyle : internalBeadStyle;
  const setBeadStyle = onBeadStyleChange || setInternalBeadStyle;
  const [isBomDrawerOpen, setIsBomDrawerOpen] = useState(false); // # 底部物料清单抽屉折叠状态
  const containerRef = useRef(null); // # 容器引用
  const canvasRef = useRef(null); // # 画布引用
  const origImgRef = useRef(null); // # 原图图像引用
  const pinchStartRef = useRef(null); // # 双指缩放触摸起始状态

  const [isDrawing, setIsDrawing] = useState(false); // # 是否正在绘图
  const [zoom, setZoom] = useState(1); // # 缩放倍率
  const [pan, setPan] = useState({ x: 0, y: 0 }); // # 画布平移偏移量
  const [isPanning, setIsPanning] = useState(false); // # 是否处于平移拖拽状态
  const [panStart, setPanStart] = useState({ x: 0, y: 0 }); // # 平移起始点
  const [enableWheelZoom, setEnableWheelZoom] = useState(false); // # 滚轮缩放开关 (默认关闭防误触网页滚动)
  const [isSpacePressed, setIsSpacePressed] = useState(false); // # 空格键按住状态

  // 默认采用【实心高光微珠 (gloss)】质感，彻底消除数万个小黑孔引发的灰雾干扰

  const [curtainPos, setCurtainPos] = useState(50);
  const [isDraggingCurtain, setIsDraggingCurtain] = useState(false);
  const [completedColors, setCompletedColors] = useState(() => new Set()); // # 实体拼装打勾进度

  const toggleColorCompleted = useCallback((code, e) => {
    if (e) e.stopPropagation();
    setCompletedColors(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const height = gridData?.length || 0;
  const width = gridData?.[0]?.length || 0;

  // 基础单格尺寸 (依据大网格自动适配基数)
  const maxDim = Math.max(width, height);
  const baseCellSize = maxDim >= 220 ? 6 : maxDim >= 150 ? 8 : maxDim >= 100 ? 10 : 14;
  const cellSize = Math.max(1.5, baseCellSize * zoom);
  const rulerOffset = showRulers ? 26 : 0; // # 标尺占用尺寸

  const { map: activeColorMap, list: activeBrandColorList } = getPaletteDataByBrand(paletteBrand);
  const [showQuickPalette, setShowQuickPalette] = useState(false); // # 快捷换色浮窗展示状态
  const [quickPaletteSearch, setQuickPaletteSearch] = useState(''); // # 快捷换色搜索词

  // 快捷调色盘搜索过滤
  const filteredQuickPaletteColors = React.useMemo(() => {
    if (!quickPaletteSearch) return activeBrandColorList || [];
    const q = quickPaletteSearch.toLowerCase().trim();
    return (activeBrandColorList || []).filter(
      c => c.code.toLowerCase().includes(q) || (c.name_zh && c.name_zh.includes(q))
    );
  }, [activeBrandColorList, quickPaletteSearch]);

  // 实时统计图纸中所有色号用量 (对齐竞品用料矩阵)
  const colorStats = React.useMemo(() => {
    const counts = new Map();
    let total = 0;
    if (gridData) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const code = gridData[y][x];
          if (code && code !== 'EMPTY') {
            counts.set(code, (counts.get(code) || 0) + 1);
            total++;
          }
        }
      }
    }
    const list = Array.from(counts.entries())
      .map(([code, count]) => {
        const color = activeColorMap.get(code);
        return {
          code,
          count,
          pct: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
          name_zh: color ? color.name_zh : '未知',
          hex: color ? color.hex : '#000000',
        };
      })
      .sort((a, b) => b.count - a.count);
    return { list, total };
  }, [gridData, height, width, activeColorMap]);

  const isUserZoomedRef = useRef(false); // # 记录是否处于用户主动放大状态
  const lastContainerSizeRef = useRef({ w: 0, h: 0 }); // # 记录容器物理尺寸

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
    const safeScale = Math.max(0.02, Math.min(6.0, Number(fitScale.toFixed(3))));

    isUserZoomedRef.current = false;
    setZoom(safeScale);
    setPan({ x: 0, y: 0 });
  }, [width, height, baseCellSize, rulerOffset]);

  // 仅在图纸尺寸发生改变时执行初始铺满
  useEffect(() => {
    fitToViewport();
  }, [width, height]);

  // 监听外层容器真实物理缩放 (仅在非用户手动放大时自适应居中)
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    lastContainerSizeRef.current = { w: container.clientWidth, h: container.clientHeight };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        const dw = Math.abs(newW - lastContainerSizeRef.current.w);
        const dh = Math.abs(newH - lastContainerSizeRef.current.h);

        // 仅当外层容器真实改变(如全屏、拉伸浏览器)且未手动缩放时自适应
        if ((dw > 30 || dh > 30) && !isUserZoomedRef.current) {
          lastContainerSizeRef.current = { w: newW, h: newH };
          fitToViewport();
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fitToViewport]);

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

  // 核心 Canvas 渲染 (对齐竞品: 5×5/10×10加粗线 + 逐格清晰标尺 + 高清色号)
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
          ctx.globalAlpha = 0.12; // # 未高亮颜色暗化 88%
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
        // 模式 1: 平面像素方块
        else if (beadStyle === 'pixel') {
          ctx.fillStyle = hex;
          ctx.fillRect(posX, posY, cellSize, cellSize);
        } 
        // 模式 2: 实心高光艺术微珠 (默认推荐，无孔洞灰雾，纯正色彩)
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

        // 色号角标 (当放大到清晰可视时渲染，对比度极致清晰)
        if (showColorCodes && !isTransparent && cellSize >= 12) {
          ctx.fillStyle = getContrastTextColor(hex);
          const fontSz = Math.min(12, Math.max(7, Math.floor(cellSize * 0.36)));
          ctx.font = `700 ${fontSz}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(code, posX + cellSize / 2, posY + cellSize / 2);
        }

        ctx.restore();
      }
    }

    // 绘制 5×5 / 10×10 加粗网格辅助线 (对齐竞品工业图纸)
    if (showGridLines && cellSize >= 5) {
      // 水平线
      for (let y = 0; y <= height; y++) {
        const py = rulerOffset + y * cellSize;
        ctx.beginPath();
        ctx.moveTo(rulerOffset, py);
        ctx.lineTo(rulerOffset + gridPixelW, py);

        if (y % 10 === 0) {
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.75)'; // # 10格主分块线
          ctx.lineWidth = 1.2;
        } else if (y % 5 === 0) {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.55)'; // # 5格中粗辅助线
          ctx.lineWidth = 0.8;
        } else {
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)'; // # 普通细网格线
          ctx.lineWidth = 0.4;
        }
        ctx.stroke();
      }

      // 垂直线
      for (let x = 0; x <= width; x++) {
        const px = rulerOffset + x * cellSize;
        ctx.beginPath();
        ctx.moveTo(px, rulerOffset);
        ctx.lineTo(px, rulerOffset + gridPixelH);

        if (x % 10 === 0) {
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.75)'; // # 10格主分块线
          ctx.lineWidth = 1.2;
        } else if (x % 5 === 0) {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.55)'; // # 5格中粗辅助线
          ctx.lineWidth = 0.8;
        } else {
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)'; // # 普通细网格线
          ctx.lineWidth = 0.4;
        }
        ctx.stroke();
      }
    }

    ctx.restore();

    // 绘制外部精准标尺刻度体系 (逐格标号与加粗分块)
    if (showRulers) {
      ctx.save();
      // 标尺背景底色
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, totalWidth, rulerOffset);
      ctx.fillRect(0, 0, rulerOffset, totalHeight);

      // 标尺底部分割实线
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rulerOffset);
      ctx.lineTo(totalWidth, rulerOffset);
      ctx.moveTo(rulerOffset, 0);
      ctx.lineTo(rulerOffset, totalHeight);
      ctx.stroke();

      // 自适应标尺数字间隔
      const step = cellSize >= 16 ? 1 : cellSize >= 9 ? 2 : cellSize >= 5 ? 5 : 10;
      const fontSize = Math.min(10, Math.max(7, Math.floor(cellSize * 0.45)));

      // 顶部 X 标尺
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let x = 0; x < width; x++) {
        const num = x + 1;
        if (num % step === 0 || num === 1 || num % 5 === 0) {
          const px = rulerOffset + x * cellSize + cellSize / 2;
          const isMajor = num % 10 === 0;
          const isSemi = num % 5 === 0;
          ctx.fillStyle = isMajor ? '#0f172a' : isSemi ? '#334155' : '#94a3b8';
          ctx.font = isMajor ? `bold ${fontSize}px "JetBrains Mono", monospace` : `500 ${fontSize}px "JetBrains Mono", monospace`;
          ctx.fillText(String(num), px, rulerOffset / 2);
        }
      }

      // 左侧 Y 标尺
      for (let y = 0; y < height; y++) {
        const num = y + 1;
        if (num % step === 0 || num === 1 || num % 5 === 0) {
          const py = rulerOffset + y * cellSize + cellSize / 2;
          const isMajor = num % 10 === 0;
          const isSemi = num % 5 === 0;
          ctx.fillStyle = isMajor ? '#0f172a' : isSemi ? '#334155' : '#94a3b8';
          ctx.font = isMajor ? `bold ${fontSize}px "JetBrains Mono", monospace` : `500 ${fontSize}px "JetBrains Mono", monospace`;
          ctx.fillText(String(num), rulerOffset / 2, py);
        }
      }
      ctx.restore();
    }
  }, [gridData, width, height, cellSize, beadStyle, rulerOffset, showColorCodes, showGridLines, showRulers, highlightColorCode, activeColorMap, compareMode, curtainPos]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  function getContrastTextColor(hex) {
    if (!hex) return '#ffffff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 140 ? '#0f172a' : '#ffffff';
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

  const getTouchGridCoords = (touch) => { // # 触控坐标映射网格位置
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = touch.clientX - rect.left;
    const clientY = touch.clientY - rect.top;

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

  const lastTapRef = useRef({ time: 0, x: 0, y: 0 }); // # 双击/双触检测
  const [hoveredCell, setHoveredCell] = useState(null); // # 悬浮格点坐标与色号信息气泡

  // 监听全局空格键 (按住空格键开启抓手平移)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 聚焦指定坐标并平滑微距放大至 350%
  const focusOnPoint = (clientX, clientY) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // 若当前已处于高倍放大，双击则一键还原铺满全图
    if (zoom >= 2.0) {
      fitToViewport();
      return;
    }

    isUserZoomedRef.current = true;
    const targetZoom = 3.5;
    const targetCellSize = Math.max(1.5, baseCellSize * targetZoom);

    // 计算点击格点在网格中的位置
    const mouseX = clientX - rect.left - pan.x - rulerOffset;
    const mouseY = clientY - rect.top - pan.y - rulerOffset;
    const gridX = Math.max(0, Math.min(width - 1, Math.floor(mouseX / cellSize)));
    const gridY = Math.max(0, Math.min(height - 1, Math.floor(mouseY / cellSize)));

    const targetPointX = rulerOffset + gridX * targetCellSize + targetCellSize / 2;
    const targetPointY = rulerOffset + gridY * targetCellSize + targetCellSize / 2;

    const centerViewportX = container.clientWidth / 2;
    const centerViewportY = container.clientHeight / 2;

    setZoom(targetZoom);
    setPan({
      x: centerViewportX - targetPointX,
      y: centerViewportY - targetPointY,
    });
  };

  const handleDoubleClick = (e) => { // # 双击局部瞬间微距对焦
    focusOnPoint(e.clientX, e.clientY);
  };

  const updateHoveredCell = (clientX, clientY) => { // # 更新悬浮格点坐标探针
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left - rulerOffset) / cellSize);
    const y = Math.floor((clientY - rect.top - rulerOffset) / cellSize);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      const code = gridData[y][x];
      const color = activeColorMap.get(code);
      setHoveredCell({
        x: x + 1,
        y: y + 1,
        code: code || 'EMPTY',
        name_zh: color?.name_zh || (code === 'EMPTY' ? '留白' : '未知'),
        hex: color?.hex || '#ffffff',
      });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseDown = (e) => { // # 鼠标按下: 右键/中键/空格/抓手均支持全向平移
    if (e.button === 2 || e.button === 1 || isSpacePressed || e.altKey || currentTool === 'hand') {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    if (e.button === 0) {
      setIsDrawing(true);
      const coords = getGridCoords(e);
      if (coords) handleCellAction(coords.x, coords.y);
    }
  };

  const handleMouseMove = (e) => {
    updateHoveredCell(e.clientX, e.clientY);

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

  const handleTouchStart = (e) => { // # 触控按下支持单指绘图、双击局部对焦与双指手势
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const last = lastTapRef.current;

      // 双击对焦检测
      if (now - last.time < 300 && Math.hypot(touch.clientX - last.x, touch.clientY - last.y) < 25) {
        focusOnPoint(touch.clientX, touch.clientY);
        lastTapRef.current = { time: 0, x: 0, y: 0 };
        return;
      }
      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };

      updateHoveredCell(touch.clientX, touch.clientY);

      if (currentTool === 'hand') {
        setIsPanning(true);
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      } else {
        setIsDrawing(true);
        const coords = getTouchGridCoords(touch);
        if (coords) handleCellAction(coords.x, coords.y);
      }
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const mid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      pinchStartRef.current = { dist, zoom, pan: { ...pan }, mid };
      setIsPanning(true);
    }
  };

  const handleTouchMove = (e) => { // # 触控滑动支持平移与双指捏合缩放
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      updateHoveredCell(touch.clientX, touch.clientY);

      if (isDraggingCurtain) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const clientX = touch.clientX - rect.left - rulerOffset;
          const ratio = Math.max(0, Math.min(100, (clientX / (width * cellSize)) * 100));
          setCurtainPos(ratio);
        }
        return;
      }
      if (currentTool === 'hand' || isPanning) {
        setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y });
        return;
      }
      if (isDrawing && (currentTool === 'pencil' || currentTool === 'eraser')) {
        const coords = getTouchGridCoords(touch);
        if (coords) handleCellAction(coords.x, coords.y);
      }
    } else if (e.touches.length === 2 && pinchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleFactor = newDist / pinchStartRef.current.dist;
      const newZoom = Math.min(8.0, Math.max(0.02, Number((pinchStartRef.current.zoom * scaleFactor).toFixed(3))));
      isUserZoomedRef.current = true;
      setZoom(newZoom);

      const newMid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      const dx = newMid.x - pinchStartRef.current.mid.x;
      const dy = newMid.y - pinchStartRef.current.mid.y;
      setPan({ x: pinchStartRef.current.pan.x + dx, y: pinchStartRef.current.pan.y + dy });
    }
  };

  const handleTouchEnd = () => { // # 触控释放重置状态
    setIsDrawing(false);
    setIsPanning(false);
    setIsDraggingCurtain(false);
    pinchStartRef.current = null;
  };

  const handleWheel = (e) => { // # 滚轮事件: 仅在开启开关或按住 Ctrl/Meta 时缩放
    if (!enableWheelZoom && !e.ctrlKey && !e.metaKey) {
      return; // # 未开启开关且未按 Ctrl 时，不拦截事件，自然上下滚动网页
    }

    e.preventDefault();
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const zoomDelta = e.deltaY < 0 ? 1.15 : 0.86;
    const newZoom = Math.min(8.0, Math.max(0.02, Number((zoom * zoomDelta).toFixed(3))));
    if (newZoom === zoom) return;

    const mouseClientX = e.clientX - rect.left;
    const mouseClientY = e.clientY - rect.top;

    const currentCellSize = Math.max(1.5, baseCellSize * zoom);
    const nextCellSize = Math.max(1.5, baseCellSize * newZoom);

    const anchorCanvasX = mouseClientX - pan.x;
    const anchorCanvasY = mouseClientY - pan.y;

    const scaleRatio = nextCellSize / currentCellSize;
    const nextPanX = mouseClientX - anchorCanvasX * scaleRatio;
    const nextPanY = mouseClientY - anchorCanvasY * scaleRatio;

    isUserZoomedRef.current = true;
    setZoom(newZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  const activeColorInfo = activeColorMap.get(selectedColorCode);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-stone-200 shadow-sm select-none">
      {/* 核心工作台视口 (支持光标无级局部缩放、双击对焦与全向平移) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        onMouseLeave={() => { setHoveredCell(null); setIsPanning(false); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
        className={`relative flex-1 w-full overflow-hidden pegboard-surface flex items-center justify-center p-2 sm:p-5 select-none custom-scrollbar ${
          isPanning ? 'cursor-grabbing' : isSpacePressed || currentTool === 'hand' ? 'cursor-grab' : 'cursor-crosshair'
        }`}
      >
        {/* 悬浮实时格点坐标与色号信息探针 (跟随或吸附左上角) */}
        {hoveredCell && (
          <div className="absolute top-3 left-3 z-30 bg-stone-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 shadow-xl pointer-events-none border border-white/15 animate-studio-in">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>({hoveredCell.x}, {hoveredCell.y})</span>
            </span>
            <span className="text-stone-500">|</span>
            <span
              className="w-3.5 h-3.5 rounded border border-white/40 shadow-xs shrink-0"
              style={{ backgroundColor: hoveredCell.hex }}
            />
            <span className="font-bold text-stone-100">{hoveredCell.code}</span>
            <span className="text-stone-300 text-[11px]">{hoveredCell.name_zh}</span>
          </div>
        )}

        {/* 画布右下角仅保留轻量滚轮缩放提示开关 */}
        <button
          type="button"
          onClick={() => setEnableWheelZoom(prev => !prev)}
          className={`absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors shadow-sm border border-stone-200/90 backdrop-blur-md ${
            enableWheelZoom
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'bg-white/85 text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
          title={enableWheelZoom ? '滚轮缩放已开启 (滚轮直接缩放画布)' : '滚轮缩放已关闭 (按住 Ctrl+滚轮也可即时缩放)'}
        >
          <span>滚轮缩放: {enableWheelZoom ? '开' : '关'}</span>
        </button>

        {/* Google Stitch: Floating Tactical Canvas HUD Toolbar at bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center whitespace-nowrap bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-stone-200/90 gap-2.5 sm:gap-3 text-xs select-none shrink-0">
          {/* 网格标线开关 */}
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 font-medium hover:text-stone-900 transition-colors shrink-0 whitespace-nowrap">
            <input
              type="checkbox"
              checked={showGridLines}
              onChange={() => onToggleGridLines && onToggleGridLines()}
              className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer shrink-0"
            />
            <span className="text-[11px] font-semibold whitespace-nowrap">网格线</span>
          </label>

          <div className="w-px h-3.5 bg-stone-200 shrink-0" />

          {/* 覆叠色号标字 */}
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 font-medium hover:text-stone-900 transition-colors shrink-0 whitespace-nowrap">
            <input
              type="checkbox"
              checked={showColorCodes}
              onChange={() => onToggleColorCodes && onToggleColorCodes()}
              className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer shrink-0"
            />
            <span className="text-[11px] font-semibold whitespace-nowrap">色号标字</span>
          </label>

          <div className="w-px h-3.5 bg-stone-200 shrink-0" />

          {/* 颗粒规格药丸 */}
          <div className="hidden sm:flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg font-mono text-[10px] shrink-0 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block shrink-0" />
            <span className="font-bold text-stone-800 whitespace-nowrap">2.6mm 迷你豆</span>
            <span className="text-stone-400 whitespace-nowrap">/ 1:1 实物比例</span>
          </div>

          <div className="w-px h-3.5 bg-stone-200 hidden sm:block shrink-0" />

          {/* 缩放控制器 */}
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => {
                isUserZoomedRef.current = true;
                setZoom(prev => Math.max(0.02, Number((prev - 0.2).toFixed(3))));
              }}
              className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors shrink-0"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-stone-700 px-1 min-w-[38px] text-center text-[11px] shrink-0 whitespace-nowrap">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                isUserZoomedRef.current = true;
                setZoom(prev => Math.min(8.0, Number((prev + 0.2).toFixed(3))));
              }}
              className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors shrink-0"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={fitToViewport}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-2xs transition-colors shrink-0 whitespace-nowrap"
              title="铺满自适应视口"
            >
              适应
            </button>
          </div>

          <div className="w-px h-3.5 bg-stone-200 shrink-0" />

          {/* 当前激活画笔色卡弹窗快捷入口 */}
          <button
            type="button"
            onClick={() => setShowQuickPalette(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono font-bold transition-colors shadow-2xs border border-stone-200/60 shrink-0 whitespace-nowrap"
            title="挑选画笔颜色"
          >
            <span
              className="w-3 h-3 rounded-xs border border-black/20 shrink-0"
              style={{ backgroundColor: activeColorInfo?.hex || '#000000' }}
            />
            <span className="whitespace-nowrap">{selectedColorCode}</span>
          </button>
        </div>


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
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsDraggingCurtain(true);
              }}
              className="absolute top-0 bottom-0 w-7 z-30 cursor-ew-resize flex items-center justify-center group pointer-events-auto"
            >
              <div className="w-0.5 h-full bg-amber-500 shadow-md group-hover:w-1 transition-all" />
              <div className="absolute w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部轻量工坊状态与物料清单抽屉 */}
      <div className="bg-white border-t border-stone-200 shrink-0 select-none">
        {/* 状态与触发栏 (常驻单行，仅 38px 高) */}
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-stone-600 gap-2">
          {/* 左侧微状态胶囊 (Linear 风格轻量明亮设计) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-900 font-bold border border-stone-200/80 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>总豆量 {colorStats.total.toLocaleString()} 粒</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium border border-stone-200/80 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>用料 {colorStats.list.length} 色</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 text-stone-500 font-mono text-[11px] border border-stone-200/60 shrink-0">
              {paletteBrand} · {width}×{height} 格
            </span>

            {completedColors.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-2xs shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>已拼完 {completedColors.size}/{colorStats.list.length} 色</span>
              </span>
            )}
          </div>

          {/* 右侧：画笔快捷选色 + 展开/折叠抽屉按钮 */}
          <div className="flex items-center gap-2 shrink-0">
            {highlightColorCode && (
              <button
                type="button"
                onClick={() => onToggleHighlightColorCode && onToggleHighlightColorCode(null)}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-[11px] font-bold transition-colors"
              >
                <span>取消高亮 [{highlightColorCode}]</span>
              </button>
            )}

            {/* 快捷选色浮窗触发按键 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickPalette(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-white font-mono text-[10px] sm:text-[11px] shadow-xs font-bold transition-all active:scale-95 hover:shadow-md cursor-pointer ring-1 ring-black/15 hover:ring-black/35"
                style={{ backgroundColor: activeColorInfo?.hex || '#18181b', color: getContrastTextColor(activeColorInfo?.hex) }}
                title="点击直接快速切换画笔颜色"
              >
                <Palette className="w-3 h-3" />
                <span>画笔: {selectedColorCode} · {activeColorInfo?.name_zh || '选择颜色'}</span>
                <span className="text-[10px] opacity-80 font-sans">▾</span>
              </button>

              {/* 快捷选色浮窗 (居中弹窗，宽度饱满 380px，支持搜索与全量色号网格) */}
              {showQuickPalette && (
                <>
                  {/* 背景点击收起遮罩 */}
                  <div
                    onClick={() => setShowQuickPalette(false)}
                    className="fixed inset-0 z-40 bg-stone-900/25 backdrop-blur-2xs transition-opacity"
                  />

                  {/* 调色盘主体容器 (饱满 380px 宽度，底部居中浮动，彻底解决过窄挤压与文字折行) */}
                  <div
                    className="fixed z-50 left-1/2 bottom-16 -translate-x-1/2 w-[380px] max-w-[94vw] max-h-[82vh] sm:max-h-[490px] bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-3.5 select-none flex flex-col animate-studio-in"
                  >
                    {/* 标头与醒目关闭按钮 */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-100 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 whitespace-nowrap">
                        <Palette className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>快捷调色盘 ({paletteBrand})</span>
                        <span className="text-[10px] text-stone-400 font-normal">共 {activeBrandColorList?.length || 0} 色</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickPalette(false)}
                        className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors shrink-0"
                        title="关闭调色盘"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 1. 优先置顶: 本图正在使用的颜色 */}
                    {colorStats.list.length > 0 && !quickPaletteSearch && (
                      <div className="mb-2 pb-2 border-b border-stone-100 shrink-0">
                        <div className="text-[10px] font-bold text-stone-700 mb-1.5 flex items-center justify-between whitespace-nowrap">
                          <span className="flex items-center gap-1 text-rose-600 font-bold">
                            <Pin className="w-3 h-3 shrink-0" />
                            <span>本图已用色 ({colorStats.list.length} 色)</span>
                          </span>
                          <span className="text-[9px] text-stone-400 font-normal">点击即切画笔</span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-24 sm:max-h-20 overflow-y-auto custom-scrollbar pr-0.5">
                          {colorStats.list.map((item) => {
                            const isSelected = selectedColorCode === item.code;
                            return (
                              <button
                                key={`used-${item.code}`}
                                type="button"
                                onClick={() => {
                                  onSelectColorCode(item.code);
                                  setShowQuickPalette(false);
                                }}
                                className={`flex items-center gap-1 px-2 py-1 sm:px-1.5 sm:py-0.5 rounded border text-[11px] sm:text-[10px] font-mono font-bold transition-all active:scale-95 shrink-0 whitespace-nowrap ${
                                  isSelected
                                    ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                                    : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800'
                                }`}
                                title={`${item.code} ${item.name_zh} · 用量 ${item.count} 颗`}
                              >
                                <span
                                  className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-xs border border-black/15 shrink-0"
                                  style={{ backgroundColor: item.hex }}
                                />
                                <span className="font-mono">{item.code}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. 搜索过滤框 */}
                    <div className="mb-2 shrink-0">
                      <input
                        type="text"
                        placeholder="搜索全部色号或名称 (如 H7 / 纯黑 / 蓝)..."
                        value={quickPaletteSearch}
                        onChange={(e) => setQuickPaletteSearch(e.target.value)}
                        className="w-full px-3 py-1.5 bg-stone-50 rounded-xl text-xs border border-stone-200 focus:border-rose-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
                      />
                    </div>

                    {/* 3. 全量色号网格 */}
                    <div className="text-[10px] font-bold text-stone-500 mb-1.5 flex items-center justify-between shrink-0 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>全部品牌色库 ({filteredQuickPaletteColors.length} 色)</span>
                      </span>
                      {quickPaletteSearch && (
                        <button
                          type="button"
                          onClick={() => setQuickPaletteSearch('')}
                          className="text-rose-600 hover:underline"
                        >
                          清空搜索
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 overflow-y-auto custom-scrollbar p-1 flex-1 min-h-[160px] max-h-[250px]">
                      {filteredQuickPaletteColors.map((c) => {
                        const isSelected = selectedColorCode === c.code;
                        const contrastColor = getContrastTextColor(c.hex);
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              onSelectColorCode(c.code);
                              setShowQuickPalette(false);
                            }}
                            className={`group flex flex-col items-center p-1.5 rounded-xl border transition-all active:scale-95 ${
                              isSelected
                                ? 'ring-2 ring-rose-500 border-rose-500 shadow-sm bg-rose-50/50'
                                : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50'
                            }`}
                            title={`${c.code} - ${c.name_zh || ''}`}
                          >
                            <div
                              className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg shadow-2xs border border-black/10 flex items-center justify-center font-mono font-bold text-[9px] shrink-0"
                              style={{ backgroundColor: c.hex, color: contrastColor }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-stone-700 mt-1 truncate w-full text-center whitespace-nowrap">
                              {c.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* 4. 移动端完成返回大按钮 */}
                    <div className="pt-2 mt-2 border-t border-stone-100 sm:hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowQuickPalette(false)}
                        className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>选定并返回图纸</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 折叠/展开 BOM 胶囊清单抽屉按钮 */}
            <button
              type="button"
              onClick={() => setIsBomDrawerOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs transition-colors shadow-2xs border ${
                isBomDrawerOpen
                  ? 'bg-stone-900 text-white border-stone-900 font-bold'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
              title={isBomDrawerOpen ? '收起物料清单' : '展开全部物料清单'}
            >
              <span>物料清单 ({colorStats.list.length}色)</span>
              {isBomDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 折叠抽屉：BOM 颜色胶囊列表 */}
        {isBomDrawerOpen && (
          <div className="p-2 sm:p-3 border-t border-stone-100 bg-stone-50/70 max-h-48 overflow-y-auto custom-scrollbar animate-studio-in">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2 px-1">
              <span>点击色卡高亮定位，右侧打勾记录手工拼制进度</span>
              <span className="font-mono text-[11px]">共计 {colorStats.list.length} 种色号 · 按用量降序排列</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {colorStats.list.map((item) => {
                const isHighlighted = highlightColorCode === item.code;
                const contrastText = getContrastTextColor(item.hex);
                const isCompleted = completedColors.has(item.code);

                return (
                  <div
                    key={item.code}
                    className={`relative group inline-flex items-stretch rounded border text-xs overflow-hidden transition-all shadow-2xs select-none ${
                      isCompleted ? 'opacity-55 border-stone-200' : ''
                    } ${
                      isHighlighted
                        ? 'ring-2 ring-amber-500 border-amber-500 shadow-sm scale-105 z-10'
                        : 'border-stone-300 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (onToggleHighlightColorCode) {
                          onToggleHighlightColorCode(item.code);
                        }
                        onSelectColorCode(item.code);
                      }}
                      className="inline-flex items-stretch active:scale-95 transition-transform"
                      title={`点击在画布中高亮显示 [${item.code} ${item.name_zh}] · 用量 ${item.count} 颗 (${item.pct}%)\n点击右侧小对勾可标记拼装进度`}
                    >
                      {/* 左侧色块 + 色号 (高对比度) */}
                      <div
                        className="px-2 py-0.5 sm:py-1 font-mono font-bold text-[11px] flex items-center justify-center min-w-[38px]"
                        style={{ backgroundColor: item.hex, color: contrastText }}
                      >
                        {isCompleted ? <span className="line-through opacity-80">{item.code}</span> : item.code}
                      </div>

                      {/* 右侧白底精确用量颗数 */}
                      <div className="px-1.5 py-0.5 sm:py-1 bg-white font-mono font-bold text-stone-900 text-[11px] flex items-center justify-center border-l border-stone-200 group-hover:bg-stone-50 min-w-[32px]">
                        {item.count}
                      </div>
                    </button>

                    {/* 拼装进度打勾标记按键 */}
                    <button
                      type="button"
                      onClick={(e) => toggleColorCompleted(item.code, e)}
                      className={`px-1 py-0.5 border-l border-stone-200 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-50 text-stone-300 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isCompleted ? '已拼完此色（点击取消完成标记）' : '标记此色已拼装完成'}
                    >
                      <Check className={`w-3 h-3 ${isCompleted ? 'stroke-[3]' : 'stroke-[2]'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
