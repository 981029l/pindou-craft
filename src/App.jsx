import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import OriginalImageCard from './components/OriginalImageCard';
import ParameterSettingsCard from './components/ParameterSettingsCard';
import PatternPreviewHeader from './components/PatternPreviewHeader';
import CanvasEditor from './components/CanvasEditor';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import { getStoredAiConfig } from './config/apiConfig';
import { processImageToPindouGrid } from './core/imageProcessor';

const DEFAULT_SAMPLE_IMG = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><rect width="400" height="400" fill="%23111420"/><circle cx="200" cy="200" r="140" fill="none" stroke="%23f59e0b" stroke-width="4"/><path d="M100 200 Q200 130 300 200 Q200 270 100 200 Z" fill="none" stroke="%23f59e0b" stroke-width="5"/><circle cx="200" cy="200" r="36" fill="%231e293b" stroke="%23f59e0b" stroke-width="4"/><circle cx="200" cy="200" r="16" fill="%23f59e0b"/><path d="M120 150 Q200 110 280 150" fill="none" stroke="%23f59e0b" stroke-width="6" stroke-linecap="round"/></svg>';

export default function App() {
  const [currentImageSrc, setCurrentImageSrc] = useState(DEFAULT_SAMPLE_IMG);
  const [patternName, setPatternName] = useState('拼豆图纸 - 超清全色谱');

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
  const [showRulers, setShowRulers] = useState(true);
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

  const handleImageChanged = (newSrc) => {
    setCurrentImageSrc(newSrc);
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

      {/* 主工作区 */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 左栏 (4 列): 原图上传与参数控制面板 */}
        <div className="lg:col-span-4 space-y-4">
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

        {/* 右栏 (8 列): 图纸预览与超清工作台 */}
        <div className="lg:col-span-8 flex flex-col h-[840px] rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
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
