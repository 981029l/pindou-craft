import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Check, 
  Camera, 
  Crown, 
  LayoutGrid, 
  Gamepad2, 
  Settings, 
  Wand2, 
  Send, 
  Type, 
  Trash2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import GlassCard from './GlassCard';
import CustomDropdown from './CustomDropdown';
import { buildPixelArtPrompt, generateAiImage, editAiImage } from '../core/aiService';
import { PRESET_GALLERY } from '../data/samplePresets';
import defaultSampleImg from '../assets/default_sample.webp';

// 将任意图片源（本地文件、DataURL、WebP 等）安全规范化转换为标准 PNG File 对象
async function ensureImageFile(imageSource, filename = 'reference.png') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], filename, { type: 'image/png' }));
          } else {
            reject(new Error('图片格式转换失败'));
          }
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('无法读取图片源，请重新上传'));
    img.src = imageSource;
  });
}

// 纯文字生图灵感标签
const TEXT_INSPIRATION_TAGS = [
  { label: '🍎 桌面红苹果', prompt: 'a red apple on a wooden table, warm light, photorealistic, perler bead pixel art' },
  { label: '🐱 治愈系橘猫', prompt: 'cute ginger tabby cat sitting, warm soft light, clean outlines, solid color blocks, pixel craft' },
  { label: '👧 动漫少女头像', prompt: 'anime girl with silver hair and purple eyes, clean outlines, high contrast perler bead pattern' },
  { label: '👾 复古街机精灵', prompt: 'retro 8-bit pixel game character, sharp outlines, vibrant arcade palette, minimalist' },
  { label: '🌸 向日葵盆栽', prompt: 'blooming sunflower in a ceramic pot, vivid yellow and green, clean flat blocks, cute sticker style' }
];

// 图生图重绘灵感修饰词
const EDIT_INSPIRATION_TAGS = [
  { label: '🎨 漫画化', prompt: '漫画化，日系二次元动漫立绘风格，清晰黑描边，纯净大色块，剔除杂色' },
  { label: '👾 8-Bit像素化', prompt: '8-bit retro arcade pixel mosaic, bold high-contrast outlines, simplified perler beads' },
  { label: '✨ Q版可爱萌化', prompt: 'chibi cute cartoon character, bold contours, vibrant flat colors, sweet pastel tones' },
  { label: '🖼️ 油画复古质感', prompt: 'classic impressionist oil painting texture, rich color contrast, artistic perler pattern' }
];

export default function OriginalImageCard({
  currentImageSrc,
  onImageChanged,
  onOpenSettings,
  hasApiKey,
  gridSize = 140,
  onSelectPreset,
}) {
  // 当前主模式: 'text' (纯文字从零生图) | 'image' (上传图片 / 以图生图)
  const [activeTab, setActiveTab] = useState(currentImageSrc ? 'image' : 'text');

  // 1. 纯文字生图 Prompt (POST /images/generations)
  const [userTextPrompt, setUserTextPrompt] = useState('a red apple on a wooden table, warm light, photorealistic');

  // 2. 以图生图重绘 Prompt (POST /images/edits)
  const [editPrompt, setEditPrompt] = useState('漫画化，日系二次元风格，清晰描边与色块');

  // 风格与生成状态
  const [aiStyle, setAiStyle] = useState('original_remaster');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // AI 多候选图结果列表与当前选中索引
  const [aiCandidates, setAiCandidates] = useState([]);
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);

  // 风格选项，全量采用 Lucide 矢量图标
  const AI_STYLE_OPTIONS = [
    { value: 'original_remaster', label: '原图真实写实 (AI 保真重构 · 默认)', icon: Camera },
    { value: 'cartoon', label: 'Q版卡通纯色 (清晰黑描边)', icon: Sparkles },
    { value: 'realistic', label: '精致写实高对比 (层次丰富)', icon: Crown },
    { value: 'flat', label: '扁平大色块 (极好拼装)', icon: LayoutGrid },
    { value: 'binary', label: '黑白复古街机 (二值像素)', icon: Gamepad2 },
  ];

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  // 本地上传图片
  const handleLocalFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChanged(e.target.result);
      setAiCandidates([]); // 重置历史候选
      setActiveTab('image'); // 自动切换至以图生图 Tab
      showStatus('success', '已载入用户本地照片！可直接原图上板，或输入提示词以图生图');
    };
    reader.readAsDataURL(file);
  };

  // 清空/删除当前底图（满足老板支持纯文字生成、不带自带图片的需求）
  const handleClearCurrentImage = () => {
    onImageChanged(null);
    setAiCandidates([]);
    setActiveTab('text');
    showStatus('info', '已删除底图！插板已重置为空白板，可在下方输入文字直接 AI 生成！');
  };

  // 选中某张候选方案
  const handleSelectCandidate = (idx) => {
    if (aiCandidates[idx]) {
      setSelectedCandidateIdx(idx);
      onImageChanged(aiCandidates[idx]);
      showStatus('success', `已切换至【方案 ${idx + 1}】，插板已同步刷新！`);
    }
  };

  // 模式 1：纯文字生成新图 (POST /images/generations)
  const handleGenerateFromText = async () => {
    if (!userTextPrompt || !userTextPrompt.trim()) {
      showStatus('error', '请输入你想生成的画面文字描述！');
      return;
    }

    if (!hasApiKey) {
      showStatus('error', '请先在右上角【设置】中配置 AI 密钥');
      onOpenSettings();
      return;
    }

    setIsAiGenerating(true);
    showStatus('info', '正在调用 l0veyou.com (gpt-image-2-5-flare) 纯文字生成图像...');

    try {
      const compiledPrompt = buildPixelArtPrompt({
        userPrompt: userTextPrompt.trim(),
        style: aiStyle,
        gridWidth: gridSize,
      });

      const res = await generateAiImage({ prompt: compiledPrompt });

      if (res && res.primaryImage) {
        if (res.candidates && res.candidates.length > 0) {
          setAiCandidates(res.candidates);
          setSelectedCandidateIdx(0);
        }
        onImageChanged(res.primaryImage);
        showStatus('success', '✨ 纯文字 AI 图像生成成功！已自动转换为拼豆图纸并完成上板！');
      } else {
        throw new Error('AI 未返回有效图像数据');
      }
    } catch (err) {
      console.error('AI Text-to-Image Error:', err);
      showStatus('error', `AI 生图失败：${err.message || '网络或接口连接异常'}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 模式 2：用户上传图片，以图生图 (POST /images/edits)
  const handleImageToImage = async () => {
    if (!currentImageSrc) {
      showStatus('error', '当前没有参考底图！请先点击下方【上传本地图片】或选择样张');
      return;
    }

    if (!hasApiKey) {
      showStatus('error', '请先在右上角【设置】中配置 AI 密钥');
      onOpenSettings();
      return;
    }

    setIsAiGenerating(true);
    showStatus('info', '正在基于当前照片发起【以图生图】重绘请求 (POST /images/edits)...');

    try {
      // 安全转换当前参考图为合规 PNG File
      const file = await ensureImageFile(currentImageSrc, 'reference.png');

      // 编译用户重绘意图与拼豆画风
      const compiledPrompt = buildPixelArtPrompt({
        userPrompt: editPrompt.trim() || 'Transform this photo into clean crisp perler bead art',
        style: aiStyle,
        gridWidth: gridSize,
      });

      const res = await editAiImage({ imageFile: file, prompt: compiledPrompt });

      if (res && res.candidates && res.candidates.length > 0) {
        setAiCandidates(res.candidates);
        setSelectedCandidateIdx(0);
        onImageChanged(res.candidates[0]);

        if (res.candidates.length > 1) {
          showStatus('success', `以图生图成功！生成 ${res.candidates.length} 组方案，可在下方点击对比切换！`);
        } else {
          showStatus('success', '✨ 以图生图重绘成功！已自动替换底图并刷新拼豆图纸！');
        }
      } else {
        throw new Error('AI 接口未返回有效的图像数据');
      }
    } catch (err) {
      console.error('Image-to-Image Error:', err);
      showStatus('error', `以图生图失败：${err.message || '网络连接或接口返回错误'}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 原图直接上板 (不调用 AI，直接像素量化)
  const handleLocalDirectQuantize = () => {
    if (!currentImageSrc) return;
    onImageChanged(currentImageSrc);
    setAiCandidates([]);
    showStatus('success', '已直接按照原图色彩与画风量化上板！');
  };

  // 点击快捷样张
  const handleQuickPreset = (preset) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
      showStatus('success', `已载入预设样张【${preset.name}】！`);
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5 border border-stone-200 shadow-sm bg-white overflow-visible relative z-20 space-y-3.5">
      {/* 头部标题与服务状态 */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <h2 className="text-xs font-bold text-stone-900">AI 图纸生成中心</h2>
            <p className="text-[10px] text-stone-400 font-mono">l0veyou · gpt-image-2-5-flare</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            已就绪
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="配置 AI 密钥与端点"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 顶部双模式 Tabs: [纯文字生图] vs [上传图片 · 以图生图] */}
      <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold select-none border border-stone-200/60">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-rose-600" />
          <span>纯文字生成</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'image'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-rose-600" />
          <span>图片 · 以图生图</span>
        </button>
      </div>

      {/* ===================== 模式 1：纯文字从零生成图像 (文生图) ===================== */}
      {activeTab === 'text' && (
        <div className="space-y-3 animate-studio-in">
          {/* 当前底图状态与一键清空底图按键 */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200/80">
            <span className="flex items-center gap-1.5 truncate">
              <span className={`w-2 h-2 rounded-full ${currentImageSrc ? 'bg-amber-500' : 'bg-stone-300'}`} />
              <span className="truncate">
                {currentImageSrc ? '当前已载入底图 (可随时删除)' : '底图已清空 · 纯净空白插板'}
              </span>
            </span>
            {currentImageSrc ? (
              <button
                type="button"
                onClick={handleClearCurrentImage}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 shrink-0 ml-1"
                title="删除自带/现有底图，重置为空白拼板"
              >
                <Trash2 className="w-3 h-3" />
                <span>清空底图</span>
              </button>
            ) : (
              <span className="text-[10px] text-emerald-600 font-medium">无干扰 · 专注生图</span>
            )}
          </div>

          {/* 用户文字描述输入框 */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-1">
              <span className="flex items-center gap-1">
                <Type className="w-3 h-3 text-rose-500" />
                <span>画面文字描述 (Prompt)：</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">1024×1024 1K</span>
            </div>
            <textarea
              rows={3}
              value={userTextPrompt}
              onChange={(e) => setUserTextPrompt(e.target.value)}
              placeholder="请输入你想生成的画面描述，例如：一只可爱的戴草帽柯基、红色富士苹果在木质桌上、复古街机少女..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-2xs leading-relaxed"
            />
          </div>

          {/* 灵感气泡快捷填入 */}
          <div>
            <div className="text-[10px] font-bold text-stone-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>灵感关键词 (点击自动填入)：</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {TEXT_INSPIRATION_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setUserTextPrompt(tag.prompt)}
                  className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-stone-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* 画风模式选择 */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              拼豆画风适配：
            </label>
            <CustomDropdown
              options={AI_STYLE_OPTIONS}
              value={aiStyle}
              onChange={setAiStyle}
            />
          </div>

          {/* 纯文字一键 AI 生图主按键 */}
          <button
            type="button"
            onClick={handleGenerateFromText}
            disabled={isAiGenerating}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 正在纯文字作画并上板中...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 fill-current" />
                <span>✨ 开始纯文字 AI 生图并一键上板</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ===================== 模式 2：用户上传图片 · 以图生图 (图生图) ===================== */}
      {activeTab === 'image' && (
        <div className="space-y-3 animate-studio-in">
          {/* 参考图预览或上传引导 */}
          <div className="relative rounded-2xl bg-stone-950 p-1 border border-stone-200 shadow-inner flex items-center justify-center min-h-[160px] max-h-[190px] overflow-hidden group">
            {currentImageSrc ? (
              <>
                <img
                  src={currentImageSrc}
                  alt="参考底图预览"
                  className="max-h-[180px] w-auto max-w-full object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleClearCurrentImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/65 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors shadow-sm"
                  title="删除此底图，切回空白画布"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-8 h-8 mx-auto text-stone-500 mb-2" />
                <p className="text-xs text-stone-300 font-medium">当前暂无参考底图</p>
                <p className="text-[10px] text-stone-500 mt-0.5">请点击下方按钮上传你的照片或选择精选样张</p>
              </div>
            )}
          </div>

          {/* 快捷按钮：上传本地图片 / 删除当前图片 */}
          <div className="grid grid-cols-2 gap-2">
            <input
              id="upload-custom-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleLocalFileChange(e.target.files[0]);
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('upload-custom-photo').click()}
              className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>上传本地照片</span>
            </button>

            {currentImageSrc ? (
              <button
                type="button"
                onClick={handleClearCurrentImage}
                className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 border border-stone-200 text-stone-700 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>移除当前图片</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onImageChanged(defaultSampleImg);
                  showStatus('success', '已重新载入默认示例图片！');
                }}
                className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                <span>载入示例图片</span>
              </button>
            )}
          </div>

          {/* 精选样张试玩栏 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-stone-400">
              <span className="font-semibold flex items-center gap-1 text-stone-600">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>精选官方样张</span>
              </span>
              <span>点击试玩</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onImageChanged(defaultSampleImg);
                  showStatus('success', '已恢复超清示范图！');
                }}
                className="px-1.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-medium truncate transition-colors text-center cursor-pointer"
              >
                超清全色谱
              </button>
              {PRESET_GALLERY.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickPreset(p)}
                  className="px-1.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-medium truncate transition-colors text-center cursor-pointer"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 以图生图专属控制区 (POST /images/edits) */}
          <div className="pt-2 border-t border-stone-100 space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>以图生图重绘意图 (Prompt)：</span>
                </span>
                <span className="text-[10px] text-rose-600 font-mono">POST /edits</span>
              </div>
              <textarea
                rows={2}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="例如：漫画化、二次元立绘风格、像素简化、保留主体特征..."
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-2xs leading-relaxed"
              />
            </div>

            {/* 常用以图生图意图标签 */}
            <div className="flex flex-wrap gap-1">
              {EDIT_INSPIRATION_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setEditPrompt(tag.prompt)}
                  className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-stone-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* 画风模式选择 */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                重绘风格偏好：
              </label>
              <CustomDropdown
                options={AI_STYLE_OPTIONS}
                value={aiStyle}
                onChange={setAiStyle}
              />
            </div>

            {/* 以图生图主按钮 + 原图直接上板 */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleImageToImage}
                disabled={isAiGenerating || !currentImageSrc}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI 正在以图生图重绘中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>🎨 开始以图生图 (基于此图重绘)</span>
                  </>
                )}
              </button>

              {currentImageSrc && (
                <button
                  type="button"
                  onClick={handleLocalDirectQuantize}
                  disabled={isAiGenerating}
                  className="w-full py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>原图直接像素化上板 (不调用 AI)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 多候选方案挑选胶囊栏 (当生成多张图片时呈现) */}
      {aiCandidates.length > 1 && (
        <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2 animate-studio-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>AI 多方案挑选（共 {aiCandidates.length} 组）：</span>
            </span>
            <span className="text-[10px] text-rose-600 font-normal">点击即时切换上板</span>
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
                      ? 'border-rose-500 ring-2 ring-rose-400/40 shadow-md scale-[1.02]'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={candUrl}
                    alt={`候选方案 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-[9px] font-bold ${
                      isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-900/70 text-stone-200'
                    }`}
                  >
                    方案 {idx + 1}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
    </GlassCard>
  );
}
