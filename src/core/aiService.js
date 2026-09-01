// 兼容 OpenAI 开放接口规范的纯 AI 生图与图像编辑重构服务模块 (支持原图保真重构与各画风 Prompt 编译)
import { getStoredAiConfig } from '../config/apiConfig';

// 将自然语言参数编译为适合拼豆重绘的高保真 Prompt
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

export async function generateAiImage({ prompt, customConfig = {} }) {
  const config = { ...getStoredAiConfig(), ...customConfig };

  if (!config.apiKey) {
    throw new Error('请先在右上角【设置】中配置您的 AI API Key');
  }

  const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/images/generations`;

  const requestBody = {
    model: config.model || 'gpt-image-2',
    prompt: prompt,
    n: Number(config.nCandidates) || 1,
    size: config.imageSize || '1024x1024',
    quality: config.quality || 'standard',
    response_format: config.responseFormat || 'url',
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey.trim()}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `AI 生成接口报错 (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) errorMessage = parsed.error.message;
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

export async function editAiImage({ imageFile, prompt, customConfig = {} }) {
  const config = { ...getStoredAiConfig(), ...customConfig };

  if (!config.apiKey) {
    throw new Error('请先在右上角【设置】中配置您的 AI API Key');
  }

  const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/images/edits`;

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('prompt', prompt);
  formData.append('model', config.model || 'gpt-image-2');
  formData.append('n', Number(config.nCandidates) || 1);
  formData.append('size', config.imageSize || '1024x1024');
  formData.append('response_format', config.responseFormat || 'url');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey.trim()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `AI 图像编辑接口报错 (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) errorMessage = parsed.error.message;
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
  };
}

export async function testAiConnection(config) {
  try {
    const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/models`;
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
