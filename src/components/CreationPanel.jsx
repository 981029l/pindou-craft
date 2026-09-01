import React, { useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Sliders, Wand2, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { processImageToPindouGrid } from '../core/imageProcessor';
import { buildPixelArtPrompt, generateAiImage, editAiImage, dataUrlToFile } from '../core/aiService';

export default function CreationPanel({ onGridGenerated, onOpenSettings, hasApiKey }) {
  const [activeTab, setActiveTab] = useState('ai_photo'); // 'ai_photo' | 'ai_text'

  const [gridSize, setGridSize] = useState(36);
  const [maxColors, setMaxColors] = useState(18);
  const [bgMode, setBgMode] = useState('keep');

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [photoInstruction, setPhotoInstruction] = useState('');

  const [textPrompt, setTextPrompt] = useState('');

  const [aiStyle, setAiStyle] = useState('cartoon');
  const [aiCandidates, setAiCandidates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastGeneratedAiUrl, setLastGeneratedAiUrl] = useState(null);

  const BOARD_PRESETS = [
    { label: '标准小板 (29×29)', size: 29 },
    { label: '经典方板 (36×36)', size: 36 },
    { label: '进阶大板 (52×52)', size: 52 },
    { label: '迷你方板 (16×16)', size: 16 },
  ];

  const handlePhotoSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const sampleAndApplyGrid = async (imageUrl) => {
    const result = await processImageToPindouGrid({
      imageSrc: imageUrl,
      gridWidth: gridSize,
      gridHeight: gridSize,
      maxColors: maxColors,
      backgroundMode: bgMode,
    });
    onGridGenerated(result.grid, result.width, result.height);
  };

  const handleAiPhotoGenerate = async () => {
    if (!uploadedImage) {
      setErrorMessage('请先上传一张参考照片');
      return;
    }
    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setAiCandidates([]);

    try {
      const compiledPrompt = buildPixelArtPrompt({
        userPrompt: photoInstruction || 'Convert this photo into clean pixel art perler bead pattern',
        style: aiStyle,
        gridWidth: gridSize,
      });

      const fileToUpload = uploadedFile || dataUrlToFile(uploadedImage, 'reference.png');
      
      let res;
      try {
        res = await editAiImage({ imageFile: fileToUpload, prompt: compiledPrompt });
      } catch (editErr) {
        console.warn('AI Edit API failed, trying generation fallback', editErr);
        res = await generateAiImage({ prompt: compiledPrompt });
      }

      setAiCandidates(res.candidates);
      setLastGeneratedAiUrl(res.primaryImage);
      await sampleAndApplyGrid(res.primaryImage);
    } catch (err) {
      setErrorMessage(err.message || 'AI 照片重构失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiTextGenerate = async () => {
    if (!textPrompt.trim()) {
      setErrorMessage('请输入图案描述');
      return;
    }
    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setAiCandidates([]);

    try {
      const compiledPrompt = buildPixelArtPrompt({
        userPrompt: textPrompt,
        style: aiStyle,
        gridWidth: gridSize,
      });

      const res = await generateAiImage({ prompt: compiledPrompt });
      setAiCandidates(res.candidates);
      setLastGeneratedAiUrl(res.primaryImage);
      await sampleAndApplyGrid(res.primaryImage);
    } catch (err) {
      setErrorMessage(err.message || 'AI 生图失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5 border border-stone-200 shadow-sm">
      {/* 顶部 Tab 切换 */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200 mb-4">
        <button
          onClick={() => { setActiveTab('ai_photo'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ai_photo'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>AI 照片重构</span>
        </button>

        <button
          onClick={() => { setActiveTab('ai_text'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ai_text'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI 灵感生图</span>
        </button>
      </div>

      {/* 未配置 Key 提示 */}
      {!hasApiKey && (
        <div 
          onClick={onOpenSettings}
          className="mb-3.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors text-xs"
        >
          <div className="flex items-center gap-2 text-amber-800">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>尚未配置 AI Key，点击配置</span>
          </div>
          <span className="text-amber-700 font-semibold underline">设置</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 模式 1: AI 照片重绘 */}
      {activeTab === 'ai_photo' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handlePhotoSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById('ai-photo-upload').click()}
            className="group relative border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-4 text-center cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-colors"
          >
            <input
              id="ai-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]);
              }}
            />
            {uploadedImage ? (
              <div className="flex items-center justify-center gap-3">
                <img
                  src={uploadedImage}
                  alt="参考照片"
                  className="w-14 h-14 object-cover rounded-lg border border-stone-300 shadow-sm"
                />
                <div className="text-left">
                  <p className="text-xs font-semibold text-stone-900">照片已就绪</p>
                  <p className="text-[11px] text-stone-500">点击更换照片</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 py-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-stone-200/70 flex items-center justify-center text-stone-600">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-stone-700">
                  点击上传参考照片 (宠物/人像/二次元)
                </p>
                <p className="text-[10px] text-stone-400">
                  AI 自动识别轮廓并生成 MARD-221 拼豆图纸
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              微调补充说明 (可选)：
            </label>
            <input
              type="text"
              value={photoInstruction}
              onChange={(e) => setPhotoInstruction(e.target.value)}
              placeholder="例如：保留眼睛大高光、纯白背景、突出耳朵粉色..."
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <button
            onClick={handleAiPhotoGenerate}
            disabled={isGenerating || !uploadedImage}
            className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI 正在重绘并量化 MARD 色号...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>生成拼豆图纸</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 模式 2: AI 文生图 */}
      {activeTab === 'ai_text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              描述想要创作的拼豆图案：
            </label>
            <textarea
              rows={2}
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              placeholder="例如：戴着小红帽的柴犬、经典像素马里奥、赛博小猫..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <button
            onClick={handleAiTextGenerate}
            disabled={isGenerating || !textPrompt.trim()}
            className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI 正在生成并量化 MARD 色号...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>生成拼豆图纸</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* AI 候选图列表 */}
      {aiCandidates.length > 1 && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <p className="text-[11px] text-stone-500 mb-1.5">AI 候选方案供挑选：</p>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {aiCandidates.map((cUrl, idx) => (
              <img
                key={idx}
                src={cUrl}
                alt={`候选 ${idx + 1}`}
                onClick={() => {
                  setLastGeneratedAiUrl(cUrl);
                  sampleAndApplyGrid(cUrl);
                }}
                className={`w-12 h-12 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                  lastGeneratedAiUrl === cUrl ? 'border-stone-900 shadow-sm' : 'border-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 共享工坊规格参数 */}
      <div className="mt-3.5 pt-3 border-t border-stone-200 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">画风流派：</label>
            <select
              value={aiStyle}
              onChange={(e) => setAiStyle(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-stone-900"
            >
              <option value="cartoon">Q版卡通 (清晰纯色描边)</option>
              <option value="realistic">精致写实 (多层次)</option>
              <option value="flat">扁平极简 (好拼大色块)</option>
              <option value="binary">黑白复古 (二值像素画)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-stone-500 mb-1">AI 端点：</label>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full px-2 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-left truncate flex items-center justify-between text-xs"
            >
              <span>{hasApiKey ? '已连接' : '配置 Key'}</span>
              <Sliders className="w-3 h-3 text-stone-500" />
            </button>
          </div>
        </div>

        {/* 底板规格预设 */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
            拼豆底板规格 ({gridSize}×{gridSize} 格)：
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            {BOARD_PRESETS.map((p) => (
              <button
                key={p.size}
                type="button"
                onClick={() => {
                  setGridSize(p.size);
                  if (lastGeneratedAiUrl) {
                    setTimeout(() => sampleAndApplyGrid(lastGeneratedAiUrl), 50);
                  }
                }}
                className={`px-1.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  gridSize === p.size
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 最大用色数滑块 & 背景处理 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
          <div>
            <div className="flex justify-between text-stone-600 mb-1">
              <span>用色限制：</span>
              <span className="text-stone-900 font-bold">{maxColors} 色</span>
            </div>
            <input
              type="range"
              min="8"
              max="36"
              value={maxColors}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxColors(val);
                if (lastGeneratedAiUrl) {
                  sampleAndApplyGrid(lastGeneratedAiUrl);
                }
              }}
              className="w-full accent-stone-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1">背景模式：</label>
            <select
              value={bgMode}
              onChange={(e) => {
                setBgMode(e.target.value);
                if (lastGeneratedAiUrl) {
                  sampleAndApplyGrid(lastGeneratedAiUrl);
                }
              }}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-stone-900"
            >
              <option value="keep">保留原背景色</option>
              <option value="remove">挖空背景 (仅主体)</option>
              <option value="solid">纯白底板填充</option>
            </select>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
