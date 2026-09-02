import React, { useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon, RefreshCw, Wand2, Loader2, Play, CheckCircle2, AlertCircle, Zap, Check } from 'lucide-react';
import GlassCard from './GlassCard';
import CustomDropdown from './CustomDropdown';
import { buildPixelArtPrompt, generateAiImage, editAiImage, dataUrlToFile } from '../core/aiService';

// 将任意图片源安全转为 File 对象
async function ensureImageFile(url, filename = 'input.png') {
  if (url.startsWith('data:')) {
    return dataUrlToFile(url, filename);
  }
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

export default function OriginalImageCard({
  currentImageSrc,
  onImageChanged,
  onOpenSettings,
  hasApiKey,
  gridSize = 140,
}) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('original_remaster');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // AI 多候选图结果列表与当前选中索引
  const [aiCandidates, setAiCandidates] = useState([]);
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);

  const AI_STYLE_OPTIONS = [
    { value: 'original_remaster', label: '📷 保持原图真实写实 (AI 原图保真重构 · 默认)' },
    { value: 'cartoon', label: '🎨 Q版卡通纯色 (清晰黑描边)' },
    { value: 'realistic', label: '👑 精致写实高对比 (层次丰富)' },
    { value: 'flat', label: '📐 扁平大色块 (极好拼装)' },
    { value: 'binary', label: '🕹️ 黑白复古街机 (二值像素)' },
  ];

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const handleLocalFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChanged(e.target.result);
      setAiCandidates([]); // 重置历史候选
      showStatus('success', '已载入新照片！可直接点击下方【AI 智能重构】或【原图直接上板】');
    };
    reader.readAsDataURL(file);
  };

  // 选中某张候选方案
  const handleSelectCandidate = (idx) => {
    if (aiCandidates[idx]) {
      setSelectedCandidateIdx(idx);
      onImageChanged(aiCandidates[idx]);
      showStatus('success', `已切换至【AI 方案 ${idx + 1}】，插板已同步刷新！`);
    }
  };

  // 真实调用 AI 接口 (支持多张出图)
  const handleRealAiRemaster = async () => {
    if (!currentImageSrc) {
      showStatus('error', '请先上传参考照片！');
      return;
    }

    if (!hasApiKey) {
      showStatus('error', '请先在右上角【设置】中配置 AI API Key');
      onOpenSettings();
      return;
    }

    setIsAiGenerating(true);
    showStatus('info', '🚀 正在向 AI 接口发起请求，多方案重构中...');

    try {
      const file = await ensureImageFile(currentImageSrc, 'reference.png');
      const compiledPrompt = buildPixelArtPrompt({
        userPrompt: aiPrompt || '',
        style: aiStyle,
        gridWidth: gridSize,
      });

      console.log('Sending AI Image Edit request...', { file, compiledPrompt });
      const res = await editAiImage({ imageFile: file, prompt: compiledPrompt });

      if (res && res.candidates && res.candidates.length > 0) {
        setAiCandidates(res.candidates);
        setSelectedCandidateIdx(0);
        onImageChanged(res.candidates[0]);

        if (res.candidates.length > 1) {
          showStatus('success', `✅ AI 成功生成 ${res.candidates.length} 组候选方案！可在下方缩略图点击自由对比切换！`);
        } else {
          showStatus('success', '✅ AI 重绘成功！已从 API 接收高清图并自动上板！');
        }
      } else {
        throw new Error('AI 接口未返回有效的图像 URL');
      }
    } catch (err) {
      console.error('Real AI generation error:', err);
      showStatus('error', `AI 接口调用失败：${err.message || '网络连接或模型报错'}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 本地原图直出
  const handleLocalDirectQuantize = () => {
    if (!currentImageSrc) return;
    onImageChanged(currentImageSrc);
    setAiCandidates([]);
    showStatus('success', '✅ 已按照原图真实色彩与画风直接量化生成图纸！');
  };

  return (
    <GlassCard className="p-4 sm:p-5 border border-stone-200 shadow-sm bg-white overflow-visible relative z-20 space-y-3.5">
      {/* 标题 */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-amber-500">
            <Upload className="w-4 h-4" />
          </span>
          <h2 className="text-sm font-bold text-stone-900">原图与 AI 重绘</h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          API 就绪
        </span>
      </div>

      {/* 原图主预览视窗 */}
      <div className="relative rounded-2xl bg-stone-950 p-1 border border-stone-200 shadow-inner flex items-center justify-center min-h-[190px] overflow-hidden group">
        {currentImageSrc ? (
          <img
            src={currentImageSrc}
            alt="原图预览"
            className="max-h-[220px] w-auto max-w-full object-contain rounded-xl"
          />
        ) : (
          <div className="text-center p-4">
            <ImageIcon className="w-8 h-8 mx-auto text-stone-500 mb-2" />
            <p className="text-xs text-stone-400">暂无原图，请点击下方上传</p>
          </div>
        )}
      </div>

      {/* 多候选方案挑选胶囊栏 (当生成多张图片时呈现) */}
      {aiCandidates.length > 1 && (
        <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2 animate-studio-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI 多方案挑选（共 {aiCandidates.length} 组）：</span>
            </span>
            <span className="text-[10px] text-amber-700 font-normal">点击即时切换上板</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {aiCandidates.map((candUrl, idx) => {
              const isSelected = selectedCandidateIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCandidate(idx)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md scale-[1.02]'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={candUrl}
                    alt={`候选方案 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* 方案编号标牌 */}
                  <div
                    className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-[9px] font-bold ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-900/70 text-stone-200'
                    }`}
                  >
                    方案 {idx + 1}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 更换本地图片按键 */}
      <div>
        <input
          id="change-photo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleLocalFileChange(e.target.files[0]);
          }}
        />
        <button
          onClick={() => document.getElementById('change-photo-input').click()}
          className="w-full py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
          <span>更换本地照片</span>
        </button>
      </div>

      {/* AI 重构控制区 */}
      <div className="pt-2 border-t border-stone-100 space-y-2.5 overflow-visible relative z-30">
        <div>
          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
            AI 重构画风：
          </label>
          <CustomDropdown
            options={AI_STYLE_OPTIONS}
            value={aiStyle}
            onChange={setAiStyle}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
            微调补充说明 (可选，不填默认全自动保真)：
          </label>
          <textarea
            rows={1}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="可选：例如保留眼睛高光、强调光影细节..."
            className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-stone-900"
          />
        </div>

        {/* 两个清晰明确的执行主按键 */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleRealAiRemaster}
            disabled={isAiGenerating}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 正在绘制图纸中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>AI 智能重绘图纸</span>
              </>
            )}
          </button>

          <button
            onClick={handleLocalDirectQuantize}
            disabled={isAiGenerating}
            className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-98 border border-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-stone-600" />
            <span>原图直接生成图纸</span>
          </button>
        </div>

        {/* 状态即时提示条 */}
        {statusMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-start gap-2 animate-studio-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />}
            <div className="flex-1 font-medium">{statusMessage.text}</div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
