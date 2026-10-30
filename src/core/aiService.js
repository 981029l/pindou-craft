// 统一 AI 图像生成服务模块: 严格遵循 OpenAI 规范，全流程统一走 POST /images/generations 接口
import { getStoredAiConfig } from '../config/apiConfig';

// 将自然语言参数编译为适合拼豆的高保真 Prompt
export function buildPixelArtPrompt({ userPrompt, style = 'original_remaster', gridWidth = 100, preserveFeatures = [] }) {
  const styleKeywords = {
    original_remaster: 'High-definition realistic perler bead pixel art strictly preserving the original photo style, authentic facial features, realistic contours, natural skin tones, sharp solid color blocks, clean defined edges, no blur, no noise',
    cartoon: 'Cute crisp flat color 8-bit pixel art, perler bead craft pattern, solid clean color blocks, bold sharp black outlines, high contrast, no gradient, no blur, clean contours',
    realistic: 'High contrast retro 16-bit pixel mosaic art, defined color areas, sharp pixel edges, bold contours, distinct vibrant palette, no blur',
    flat: 'Minimalist 2D flat icon pixel art, solid single-color fills, thick black outlines, iconic silhouette, zero gradient, crisp perler bead grid',
    binary: 'Monochrome high-contrast 2-bit black and white retro pixel art, arcade game style, bold sharp lines'
  };

  const basePrompt = userPrompt && userPrompt.trim() ? userPrompt.trim() : 'Strictly preserve original image subject and features';
  let fullPrompt = `${basePrompt}. Style: ${styleKeywords[style] || styleKeywords.original_remaster}. Canvas size: ${gridWidth}x${gridWidth} bead mosaic pattern.`;
  if (preserveFeatures && preserveFeatures.length > 0) {
    fullPrompt += ` Distinct features to preserve: ${preserveFeatures.join(', ')}.`;
  }
  return fullPrompt;
}

export function dataUrlToFile(dataUrl, filename = 'input.png') {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

async function resolveImageUrlToLocalBlob(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Direct fetch of image URL failed, returning raw URL', e);
  }
  return url;
}

// 智能基准端点解析：本地开发优先走 Vite 代理，消除 OPTIONS 预检跨域问题
export function resolveEffectiveBaseUrl(rawBaseUrl) {
  const clean = (rawBaseUrl || 'https://l0veyou.com').replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && clean.includes('l0veyou.com')) {
      return '/api-l0veyou';
    }
  }
  return clean;
}

/**
 * 核心生图主方法：100% 严格请求 POST /images/generations
 * 严格按照老板最新指定：model = gpt-image-2-5-full, aspect_ratio = 1:1
 */
export async function generateAiImage({ prompt, customConfig = {} }) {
  const config = { ...getStoredAiConfig(), ...customConfig };

  if (!config.apiKey) {
    throw new Error('请先在右上角【设置】中配置您的 AI API Key');
  }

  const cleanBase = resolveEffectiveBaseUrl(config.baseUrl);
  const endpoint = `${cleanBase}/images/generations`;

  const requestId = 'pindou_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  // 严格采用老板指定的 gpt-image-2-5-full
  const resolvedModel = (!config.model || config.model === 'gpt-image-2' || config.model === 'gpt-image-2-5-flare')
    ? 'gpt-image-2-5-full' 
    : config.model;

  const requestBody = {
    model: resolvedModel,
    prompt: prompt,
    size: '1024x1024',
    aspect_ratio: '1:1', // 严格携带老板指定的 1:1 比例参数
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey.trim()}`,
      'X-Request-Id': requestId,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `AI 生成接口报错 (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) {
        errorMessage = parsed.error.message;
        if (errorMessage.includes('Image generation is not enabled for this group')) {
          errorMessage = '中转服务权限提示：当前 API Key 所在的分组未开启生图通道 (Image generation is not enabled for this group)。请在 l0veyou.com 控制台为该 Token 切换到包含生图渠道的分组。';
        }
      }
    } catch (e) {
      if (errorText) errorMessage += `: ${errorText.slice(0, 100)}`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (!result.data || result.data.length === 0) {
    throw new Error('AI 未返回有效图像数据');
  }

  const candidates = await Promise.all(
    result.data.map(async (item) => {
      if (item.url) return await resolveImageUrlToLocalBlob(item.url);
      if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
      return item.url || '';
    })
  );

  return {
    candidates,
    primaryImage: candidates[0],
    revisedPrompt: result.data[0]?.revised_prompt || prompt,
  };
}

/**
 * 图像风格重绘与以图变换：
 * 遵照老板指令：全量统一走 POST /images/generations！
 */
export async function editAiImage({ prompt, customConfig = {} }) {
  return await generateAiImage({ prompt, customConfig });
}

export async function testAiConnection(config) {
  try {
    const cleanBase = resolveEffectiveBaseUrl(config.baseUrl);
    const endpoint = `${cleanBase}/models`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey.trim()}`,
      },
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}
