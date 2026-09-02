// 全局统一配置中心: 管理 AI 接口、模型预设与本地持久化存储 # 全局统一配置中心
const STORAGE_KEY_CONFIG = 'pindou_ai_config_v1'; // # 本地存储键名

export const DEFAULT_AI_CONFIG = {
  baseUrl: '', // # 默认图像 API 接口地址
  apiKey: '', // # 默认 API Key 为空，保护用户私有凭据安全
  model: 'gpt-image-2', // # 默认图像生成模型
  imageSize: '1024x1024', // # 默认分辨率
  quality: 'standard', // # 图像生成质量
  nCandidates: 1, // # 默认生成候选数 (1~4)
  responseFormat: 'url', // # 响应格式: 'url'
};

export function getStoredAiConfig() { // # 获取本地持久化 AI 配置
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG); // # 读取本地存储
    if (!raw) return DEFAULT_AI_CONFIG; // # 未存储时返回默认配置
    const parsed = JSON.parse(raw); // # 解析存储的 JSON 数据
    return { ...DEFAULT_AI_CONFIG, ...parsed }; // # 合并配置
  } catch (e) {
    return DEFAULT_AI_CONFIG; // # 异常降级返回默认配置
  }
}

export function saveAiConfig(config) { // # 保存 AI 配置到本地存储
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config)); // # 写入本地存储
    return true; // # 保存成功返回 true
  } catch (e) {
    console.error('Failed to save config to localStorage', e); // # 异常日志
    return false; // # 保存失败返回 false
  }
}

export const PRESET_ENDPOINTS = [ // # 预设端点列表
  { name: '当前专属图像服务 (gpt-image-2)', url: 'https://image.mlgb7.com/v1', model: 'gpt-image-2', format: 'url' }, // # 专属端点
  { name: '便携 AI (备用)', url: 'https://api.bianxie.ai/v1', model: 'gpt-image-2', format: 'url' }, // # 备用端点
  { name: 'OpenAI 官方', url: 'https://api.openai.com/v1', model: 'dall-e-3', format: 'url' }, // # 官方端点
];

