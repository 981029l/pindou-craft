import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sliders, Palette } from 'lucide-react'; // # 移动端标签图标
import Navbar from './components/Navbar';
import OriginalImageCard from './components/OriginalImageCard';
import ParameterSettingsCard from './components/ParameterSettingsCard';
import PatternPreviewHeader from './components/PatternPreviewHeader';
import CanvasEditor from './components/CanvasEditor';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import { getStoredAiConfig } from './config/apiConfig';
import { processImageToPindouGrid } from './core/imageProcessor';
import defaultSampleImg from './assets/default_sample.webp'; // # 默认示范图像资源

export default function App() {
  const [currentImageSrc, setCurrentImageSrc] = useState(defaultSampleImg); // # 当前输入图像源
  const [patternName, setPatternName] = useState('拼豆图纸 - 超清全色谱'); // # 图纸名称
  const [activeMobileTab, setActiveMobileTab] = useState('canvas'); // # 移动端激活标签: 'control' | 'canvas'

  // 默认升级至 160×160 超高清网格，且完全不设上限
  const [gridWidth, setGridWidth] = useState(160);
  const [gridHeight, setGridHeight] = useState(160);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  // 实时图像滤镜与品牌 (默认关闭色数限制，100% 全色谱无损直通)
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [enableColorLimit, setEnableColorLimit] = useState(false); // 默认全色谱无损直通
  const [maxColors, setMaxColors] = useState(48);
  const [paletteBrand, setPaletteBrand] = useState('MARD');

  // 显示开关
  const [showColorCodes, setShowColorCodes] = useState(true);
  const [showRulers, setShowRulers] = useState(false); // # 默认不选中刻度标尺
  const [compareMode, setCompareMode] = useState(false);

  // 核心网格数据
  const [gridData, setGridData] = useState(() => Array.from({ length: 160 }, () => Array(160).fill('EMPTY')));
  const [selectedColorCode, setSelectedColorCode] = useState('H7');
  const [highlightColorCode, setHighlightColorCode] = useState(null);

  // 历史栈
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 弹窗状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const cfg = getStoredAiConfig();
    setHasApiKey(Boolean(cfg.apiKey));
  }, []);

  // 执行核心图纸重算 (支持全色谱无损直通)
  const recomputeGrid = useCallback(async (imgSrc, w, h, b, c, s, hasLimit, mc, brand, autoDetect = false) => {
    if (!imgSrc) return;
    try {
      const result = await processImageToPindouGrid({
        imageSrc: imgSrc,
        gridWidth: w,
        gridHeight: h,
        autoDetectGrid: autoDetect,
        enableColorLimit: hasLimit,
        maxColors: hasLimit ? mc : null,
        brightness: b,
        contrast: c,
        saturation: s,
        paletteBrand: brand || 'MARD',
      });

      if (result.naturalWidth && result.naturalHeight) {
        setAspectRatio(result.naturalWidth / result.naturalHeight);
      }

      if (autoDetect && (result.width !== w || result.height !== h)) {
        setGridWidth(result.width);
        setGridHeight(result.height);
      }

      setGridData(result.grid);
      setHistory([result.grid]);
      setHistoryIndex(0);
    } catch (err) {
      console.error('Failed to compute grid:', err);
    }
  }, []);

  useEffect(() => {
    recomputeGrid(currentImageSrc, gridWidth, gridHeight, brightness, contrast, saturation, enableColorLimit, maxColors, paletteBrand, false);
  }, []);

  const handleImageChanged = (newSrc) => { // # 图像变更回调
    setCurrentImageSrc(newSrc);
    setActiveMobileTab('canvas'); // # 移动端自动切换至画布预览
    recomputeGrid(newSrc, gridWidth, gridHeight, brightness, contrast, saturation, enableColorLimit, maxColors, paletteBrand, true);
  };

  const handleAutoDetectDensity = () => {
    recomputeGrid(currentImageSrc, gridWidth, gridHeight, brightness, contrast, saturation, enableColorLimit, maxColors, paletteBrand, true);
  };

  const debounceTimerRef = useRef(null);
  const triggerRecomputeDebounced = (b, c, s, hasLimit, mc, w, h, brand) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      recomputeGrid(currentImageSrc, w, h, b, c, s, hasLimit, mc, brand, false);
    }, 40);
  };

  const handleGridSizeChange = (val, type) => {
    if (val < 10) return;
    let newW = gridWidth;
    let newH = gridHeight;

    if (type === 'width') {
      newW = val;
      if (keepAspectRatio && aspectRatio) {
        newH = Math.max(10, Math.round(val / aspectRatio));
      }
    } else {
      newH = val;
      if (keepAspectRatio && aspectRatio) {
        newW = Math.max(10, Math.round(val * aspectRatio));
      }
    }

    setGridWidth(newW);
    setGridHeight(newH);
    triggerRecomputeDebounced(brightness, contrast, saturation, enableColorLimit, maxColors, newW, newH, paletteBrand);
  };

  const handleApplyPresetSize = (w, h) => {
    let targetW = w;
    let targetH = h;
    if (keepAspectRatio && aspectRatio) {
      targetH = Math.max(10, Math.round(w / aspectRatio));
    }
    setGridWidth(targetW);
    setGridHeight(targetH);
    triggerRecomputeDebounced(brightness, contrast, saturation, enableColorLimit, maxColors, targetW, targetH, paletteBrand);
  };

  const handleBrightnessChange = (v) => {
    setBrightness(v);
    triggerRecomputeDebounced(v, contrast, saturation, enableColorLimit, maxColors, gridWidth, gridHeight, paletteBrand);
  };

  const handleContrastChange = (v) => {
    setContrast(v);
    triggerRecomputeDebounced(brightness, v, saturation, enableColorLimit, maxColors, gridWidth, gridHeight, paletteBrand);
  };

  const handleSaturationChange = (v) => {
    setSaturation(v);
    triggerRecomputeDebounced(brightness, contrast, v, enableColorLimit, maxColors, gridWidth, gridHeight, paletteBrand);
  };

  const handleToggleColorLimit = () => {
    const nextLimit = !enableColorLimit;
    setEnableColorLimit(nextLimit);
    triggerRecomputeDebounced(brightness, contrast, saturation, nextLimit, maxColors, gridWidth, gridHeight, paletteBrand);
  };

  const handleMaxColorsChange = (v) => {
    setMaxColors(v);
    triggerRecomputeDebounced(brightness, contrast, saturation, enableColorLimit, v, gridWidth, gridHeight, paletteBrand);
  };

  const handlePaletteBrandChange = (newBrand) => {
    setPaletteBrand(newBrand);
    if (newBrand === 'PERLER') setSelectedColorCode('P18');
    else if (newBrand === 'ARTKAL') setSelectedColorCode('S20');
    else setSelectedColorCode('H7');

    triggerRecomputeDebounced(brightness, contrast, saturation, enableColorLimit, maxColors, gridWidth, gridHeight, newBrand);
  };

  const handleResetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setEnableColorLimit(false);
    triggerRecomputeDebounced(0, 0, 0, false, 48, gridWidth, gridHeight, paletteBrand);
  };

  const updateGridManual = (newGrid) => {
    setGridData(newGrid);
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(newGrid);
      if (next.length > 30) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setGridData(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setGridData(history[nextIdx]);
    }
  };

  const handleResetCanvas = () => {
    if (window.confirm('确定要重置当前图纸吗？')) {
      recomputeGrid(currentImageSrc, gridWidth, gridHeight, brightness, contrast, saturation, enableColorLimit, maxColors, paletteBrand, false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f5]">
      {/* 顶部导航 */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onReset={handleResetCanvas}
        hasApiKey={hasApiKey}
      />

      {/* 移动端沉浸式视图切换 Tabs (仅在小屏下展示) */}
      <div className="lg:hidden flex items-center justify-center px-3 py-2 bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-[49px] sm:top-[53px] z-20">
        <div className="flex bg-stone-100 p-1 rounded-xl w-full max-w-sm shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMobileTab('control')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'control'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>控制与调色</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('canvas')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'canvas'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>图纸与画布</span>
          </button>
        </div>
      </div>

      {/* 主工作区 */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-2 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-stretch">
        {/* 左栏 (4 列): 原图上传与参数控制面板 */}
        <div className={`lg:col-span-4 space-y-4 flex flex-col justify-start ${activeMobileTab === 'control' ? 'block' : 'hidden lg:block'}`}>
          <OriginalImageCard
            currentImageSrc={currentImageSrc}
            onImageChanged={handleImageChanged}
            onOpenSettings={() => setIsSettingsOpen(true)}
            hasApiKey={hasApiKey}
            gridSize={gridWidth}
          />

          <ParameterSettingsCard
            gridWidth={gridWidth}
            gridHeight={gridHeight}
            onGridSizeChange={handleGridSizeChange}
            onApplyPresetSize={handleApplyPresetSize}
            onAutoDetectDensity={handleAutoDetectDensity}
            keepAspectRatio={keepAspectRatio}
            onToggleKeepAspectRatio={() => setKeepAspectRatio(!keepAspectRatio)}
            brightness={brightness}
            onBrightnessChange={handleBrightnessChange}
            contrast={contrast}
            onContrastChange={handleContrastChange}
            saturation={saturation}
            onSaturationChange={handleSaturationChange}
            enableColorLimit={enableColorLimit}
            onToggleColorLimit={handleToggleColorLimit}
            maxColors={maxColors}
            onMaxColorsChange={handleMaxColorsChange}
            paletteBrand={paletteBrand}
            onPaletteBrandChange={handlePaletteBrandChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* 右栏 (8 列): 图纸预览与超清工作台 (PC 端自动延伸与左侧等高齐平) */}
        <div className={`lg:col-span-8 flex flex-col h-[calc(100vh-130px)] min-h-[560px] lg:h-auto lg:self-stretch lg:min-h-[960px] xl:min-h-[1050px] rounded-2xl bg-white border border-stone-200 shadow-xs overflow-hidden ${activeMobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'}`}>
          <PatternPreviewHeader
            patternName={patternName}
            onPatternNameChange={setPatternName}
            showColorCodes={showColorCodes}
            onToggleColorCodes={() => setShowColorCodes(!showColorCodes)}
            showRulers={showRulers}
            onToggleRulers={() => setShowRulers(!showRulers)}
            compareMode={compareMode}
            onToggleCompareMode={() => setCompareMode(!compareMode)}
            onReset={handleResetCanvas}
            onPrint={handlePrint}
            onDownloadPng={() => setIsExportOpen(true)}
            onExportBom={() => setIsExportOpen(true)}
          />

          <div className="flex-1 overflow-hidden relative">
            <CanvasEditor
              gridData={gridData}
              onGridChange={updateGridManual}
              originalImageSrc={currentImageSrc}
              selectedColorCode={selectedColorCode}
              onSelectColorCode={setSelectedColorCode}
              highlightColorCode={highlightColorCode}
              onToggleHighlightColorCode={(code) => setHighlightColorCode(prev => prev === code ? null : code)}
              paletteBrand={paletteBrand}
              showGridLines={true}
              showColorCodes={showColorCodes}
              showRulers={showRulers}
              compareMode={compareMode}
              undo={handleUndo}
              redo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
          </div>
        </div>
      </main>

      {/* 弹窗组件 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={(cfg) => setHasApiKey(Boolean(cfg.apiKey))}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        gridData={gridData}
        paletteBrand={paletteBrand}
      />
    </div>
  );
}
