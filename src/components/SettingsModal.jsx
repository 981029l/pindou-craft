import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Layers, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, RefreshCcw, Link2 } from 'lucide-react';
import GlassCard from './GlassCard';
import CustomDropdown from './CustomDropdown';
import { getStoredAiConfig, saveAiConfig, PRESET_ENDPOINTS, DEFAULT_AI_CONFIG } from '../config/apiConfig';
import { testAiConnection } from '../core/aiService';

export default function SettingsModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState(DEFAULT_AI_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const FORMAT_OPTIONS = [
    { value: 'url', label: 'url (推荐/广泛兼容)' },
    { value: 'b64_json', label: 'b64_json (Base64 数据)' },
  ];

  const CANDIDATE_OPTIONS = [
    { value: 1, label: '1 张候选 (最省 Token)' },
    { value: 2, label: '2 张候选 (方便对比)' },
    { value: 3, label: '3 张候选' },
    { value: 4, label: '4 张候选' },
  ];

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredAiConfig());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setConfig(prev => ({
      ...prev,
      baseUrl: preset.url,
      model: preset.model,
      responseFormat: preset.format || 'url',
    }));
  };

  const handleTest = async () => {
    setTestStatus('testing');
    const ok = await testAiConnection(config);
    setTestStatus(ok ? 'success' : 'failed');
  };

  const handleSave = () => {
    saveAiConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-studio-in">
      <div className="w-full max-w-lg">
        <GlassCard className="p-6 border border-stone-300 shadow-xl relative bg-white">
          {/* 顶部标题 */}
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  AI 服务与模型配置
                </h2>
                <p className="text-xs text-stone-400">
                  自定义 OpenAI 协议端点，凭据仅安全保存在本地浏览器
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 表单 */}
          <div className="mt-4 space-y-3.5 text-xs text-stone-700">
            {/* 快速推荐端点 */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1.5">
                快速选用端点：
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ENDPOINTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      config.baseUrl === preset.url
                        ? 'bg-stone-900 border-stone-900 text-white font-medium'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Base URL */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                API Base URL (接口根地址)
              </label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1 或 https://api.bianxie.ai/v1"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono text-xs"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                API Key (密钥)
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 模型名称、响应格式与候选 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="gpt-image-2 / dall-e-3"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-stone-500" />
                  响应格式 (format)
                </label>
                <CustomDropdown
                  options={FORMAT_OPTIONS}
                  value={config.responseFormat || 'url'}
                  onChange={(val) => setConfig({ ...config, responseFormat: val })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  候选出图数
                </label>
                <CustomDropdown
                  options={CANDIDATE_OPTIONS}
                  value={config.nCandidates || 1}
                  onChange={(val) => setConfig({ ...config, nCandidates: Number(val) })}
                />
              </div>
            </div>

            {/* 连通测试 */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={handleTest}
                disabled={testStatus === 'testing' || !config.apiKey}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 disabled:opacity-40 transition-colors"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>测试连通性</span>
              </button>

              {testStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>服务连接成功</span>
                </div>
              )}
              {testStatus === 'failed' && (
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>连接失败，请检查 URL/Key</span>
                </div>
              )}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="mt-5 pt-3.5 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setConfig(DEFAULT_AI_CONFIG)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              恢复默认
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm transition-all"
              >
                保存配置
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
