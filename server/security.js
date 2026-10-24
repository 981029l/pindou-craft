// # 微信小程序内容安全检测服务 (msgSecCheck & imgSecCheck)
const fs = require('fs');
const path = require('path');

// 内存中的 AccessToken 缓存
let tokenCache = {
  token: '',
  expiresAt: 0
};

// 本地通用敏感/违规词库 (快速本地拦截首道防线)
const SENSITIVE_PATTERNS = [
  /办证/i, /发票/i, /刻章/i, /假证/i, /代开/i, /包过/i,
  /赌博/i, /彩票/i, /六合彩/i, /百家乐/i, /博彩/i, /押注/i,
  /色情/i, /裸聊/i, /约炮/i, /兼职刷单/i, /刷单/i, /日赚/i,
  /法轮/i, /毒品/i, /大麻/i, /枪支/i, /弹药/i, /迷药/i,
  /微信[:：\s]*[a-zA-Z0-9_-]{6,}/i,
  /vx[:：\s]*[a-zA-Z0-9_-]{6,}/i,
  /qq[:：\s]*[0-9]{5,11}/i
];

/**
 * 获取微信接口调用凭证 AccessToken (自动带缓存机制)
 */
async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const appId = process.env.WECHAT_APPID;
  const appSecret = process.env.WECHAT_APPSECRET;

  if (!appId || !appSecret) {
    throw new Error('未配置 WECHAT_APPID 或 WECHAT_APPSECRET');
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.errcode) {
    throw new Error(`获取 access_token 失败 [${data.errcode}]: ${data.errmsg}`);
  }

  tokenCache.token = data.access_token;
  // 提前 300 秒刷新以确保平滑过渡
  tokenCache.expiresAt = now + (data.expires_in - 300) * 1000;
  return tokenCache.token;
}

/**
 * 文本内容安全检测 (结合本地词库 + 微信 msgSecCheck v2.0 / v1.0)
 * @param {string} content 文本内容
 * @param {string} openid 用户 openid
 * @param {number} scene 场景值 (1: 资料/标题, 2: 评论, 3: 论坛)
 */
async function checkTextSecurity(content, openid = '', scene = 2) {
  if (!content || !content.trim()) {
    return { safe: true };
  }

  const trimmed = content.trim();

  // 1. 本地首道防线拦截 (直接防御常见广告、办证、赌博等测试机器人敏感词)
  for (const regex of SENSITIVE_PATTERNS) {
    if (regex.test(trimmed)) {
      console.warn(`[Security] 本地规则拦截敏感词: ${trimmed}`);
      return {
        safe: false,
        code: 87014,
        reason: '内容包含不当或违规词汇，已被系统拦截'
      };
    }
  }

  // 2. 调用微信官方 msgSecCheck 接口
  try {
    const accessToken = await getAccessToken();

    // 如果有真实的微信 OpenID (以 o 开头且长度充足)，优先调用 v2.0
    if (openid && openid.length >= 26 && openid.startsWith('o')) {
      const v2Res = await fetch(`https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 2,
          scene: scene,
          content: trimmed,
          openid: openid
        })
      });
      const v2Data = await v2Res.json();

      if (v2Data.errcode === 0) {
        const suggest = v2Data.result?.suggest;
        if (suggest === 'risky' || suggest === 'review') {
          console.warn(`[Security] 微信 v2 拦截敏感内容: ${trimmed}, suggest: ${suggest}, label: ${v2Data.result?.label}`);
          return {
            safe: false,
            code: 87014,
            reason: '内容含有违法违规或不当信息，已被系统拦截'
          };
        }
        return { safe: true };
      } else if (v2Data.errcode === 87014) {
        return {
          safe: false,
          code: 87014,
          reason: '内容含有违法违规信息，已被系统拦截'
        };
      }
      // 若遇到 40003 (测试模拟 openid) 等异常，继续向下由 v1 接口兜底
    }

    // 微信官方 v1 接口校验兜底
    const v1Res = await fetch(`https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: trimmed
      })
    });
    const v1Data = await v1Res.json();

    if (v1Data.errcode === 87014) {
      console.warn(`[Security] 微信 v1 拦截敏感内容: ${trimmed}`);
      return {
        safe: false,
        code: 87014,
        reason: '内容含有违法违规信息，已被系统拦截'
      };
    }

    return { safe: true };
  } catch (err) {
    console.error('[Security] 微信文本检测请求异常:', err.message);
    // 外部网络异常时，以本地词库拦截结果为准，放行正常业务
    return { safe: true };
  }
}

/**
 * 图片内容安全检测 (微信官方 imgSecCheck 实时同步检测)
 * @param {string} filePath 本地图片绝对路径
 */
async function checkImageSecurity(filePath) {
  if (!fs.existsSync(filePath)) {
    return { safe: true };
  }

  try {
    const accessToken = await getAccessToken();
    const fileBuf = fs.readFileSync(filePath);
    const blob = new Blob([fileBuf]);
    const form = new FormData();
    form.append('media', blob, path.basename(filePath));

    const res = await fetch(`https://api.weixin.qq.com/wxa/img_sec_check?access_token=${accessToken}`, {
      method: 'POST',
      body: form
    });
    const data = await res.json();

    if (data.errcode === 87014) {
      console.warn(`[Security] 微信拦截违规图片: ${filePath}`);
      return {
        safe: false,
        code: 87014,
        reason: '图片包含违法违规或不当内容，已被系统拦截'
      };
    } else if (data.errcode !== 0) {
      console.warn('[Security] img_sec_check 非 0 响应:', data);
    }

    return { safe: true };
  } catch (err) {
    console.error('[Security] 微信图片检测请求异常:', err.message);
    return { safe: true };
  }
}

module.exports = {
  getAccessToken,
  checkTextSecurity,
  checkImageSecurity
};
