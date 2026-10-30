// 全局统一配置中心: 管理 AI 接口、模型预设与本地持久化存储 # 全局统一配置中心
const STORAGE_KEY_CONFIG = 'pindou_ai_config_v3'; // # 升级配置键名避免读取旧版残留模型

export const DEFAULT_AI_CONFIG = {
  baseUrl: 'https://l0veyou.com', // # 默认图像 API 接口地址
  apiKey: 'sk-f99f39b21745184d279b2e17c52c92675c27d17d59a1477f0701bdeb1e9b6218', // # 默认内置 API Key
  model: 'gpt-image-2-5-full', // # 默认图像生成模型 (遵照老板指定)
  aspectRatio: '1:1', // # 默认画面比例 1:1
  imageSize: '1024x1024', // # 默认分辨率 (1K)
  quality: 'standard', // # 图像生成质量
  nCandidates: 1, // # 默认生成候选数 (1~4)
  responseFormat: 'url', // # 响应格式: 'url'
};

export function getStoredAiConfig() { // # 获取本地持久化 AI 配置
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG) || localStorage.getItem('pindou_ai_config_v2') || localStorage.getItem('pindou_ai_config_v1');
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_AI_CONFIG, ...parsed };

    // 强校验纠偏: 遵照老板指定，强制更新模型为 gpt-image-2-5-full 与 1:1 比例
    if (!merged.model || merged.model === 'gpt-image-2' || merged.model === 'gpt-image-2-5-flare') {
      merged.model = DEFAULT_AI_CONFIG.model;
    }
    merged.aspectRatio = '1:1';

    if (!merged.apiKey || !merged.baseUrl || merged.baseUrl.includes('image.mlgb7.com')) {
      merged.apiKey = DEFAULT_AI_CONFIG.apiKey;
      merged.baseUrl = DEFAULT_AI_CONFIG.baseUrl;
      merged.model = DEFAULT_AI_CONFIG.model;
    }
    return merged;
  } catch (e) {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function saveAiConfig(config) { // # 保存 AI 配置到本地存储
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
    return false;
  }
}

export const PRESET_ENDPOINTS = [ // # 预设端点列表
  { name: 'l0veyou 完整通道 (gpt-image-2-5-full · 推荐)', url: 'https://l0veyou.com', model: 'gpt-image-2-5-full', format: 'url' },
  { name: 'l0veyou 极速生图 (gpt-image-2-5-flare)', url: 'https://l0veyou.com', model: 'gpt-image-2-5-flare', format: 'url' },
  { name: '专属图像服务 (gpt-image-2)', url: 'https://image.mlgb7.com/v1', model: 'gpt-image-2', format: 'url' },
  { name: 'OpenAI 官方 (dall-e-3)', url: 'https://api.openai.com/v1', model: 'dall-e-3', format: 'url' },
];
