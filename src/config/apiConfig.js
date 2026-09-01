// 全局统一配置中心: 管理 AI 接口、模型预设与本地持久化存储
const STORAGE_KEY_CONFIG = 'pindou_ai_config_v1';

export const DEFAULT_AI_CONFIG = {
  baseUrl: 'https://image.mlgb7.com/v1', // 用户专用图像 API 接口地址
  apiKey: 'lupi_7XBAkHXkFBbTApbnhmqGIHtJuSrDglVXAs0km6U86Fs', // 用户专用 API Key
  model: 'gpt-image-2', // 默认图像生成模型
  imageSize: '1024x1024', // 默认分辨率
  quality: 'standard', // 图像生成质量
  nCandidates: 1, // 默认生成候选数 (1~4)
  responseFormat: 'url', // 响应格式: 'url' (当前接口专用)
};

export function getStoredAiConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_AI_CONFIG;
    const parsed = JSON.parse(raw);
    // 若原先为空 key，自动更新为当前最新默认凭据
    if (!parsed.apiKey) {
      return { ...DEFAULT_AI_CONFIG, ...parsed, apiKey: DEFAULT_AI_CONFIG.apiKey, baseUrl: DEFAULT_AI_CONFIG.baseUrl };
    }
    return { ...DEFAULT_AI_CONFIG, ...parsed };
  } catch (e) {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAiConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
    return false;
  }
}

export const PRESET_ENDPOINTS = [
  { name: '当前专属图像服务 (gpt-image-2)', url: 'https://image.mlgb7.com/v1', model: 'gpt-image-2', format: 'url' },
  { name: '便携 AI (备用)', url: 'https://api.bianxie.ai/v1', model: 'gpt-image-2', format: 'url' },
  { name: 'OpenAI 官方', url: 'https://api.openai.com/v1', model: 'dall-e-3', format: 'url' },
];
