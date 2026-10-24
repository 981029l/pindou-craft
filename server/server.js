// # 拼豆工坊自建独立 Node.js 后端服务
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('./db.js');
const security = require('./security.js');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pindou_default_secret_key_2026';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// # 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// # 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// # 静态托管图片资源
app.use('/uploads', express.static(UPLOAD_DIR));

// # Multer 文件上传配置
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const filename = `preview_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 限制 10MB
});

// # JWT 鉴权解析中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

// # 强制登录拦截中间件
function requireAuth(req, res, next) {
  if (!req.user || !req.user.openid) {
    return res.status(401).json({ success: false, code: 401, message: '请先登录' });
  }
  next();
}

app.use(authMiddleware);

// ======================= API 路由定义 =======================

// # 0. 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PinDou Atelier API',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// # 1. 微信登录授权接口 (code2session)
app.post('/api/auth/login', async (req, res) => {
  const { code, nickname = '拼豆创作者', avatar = '' } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: '缺少登录凭证 code' });
  }

  const appId = process.env.WECHAT_APPID;
  const appSecret = process.env.WECHAT_APPSECRET;

  let openid = '';

  // # 如果配置了真实微信 AppId & Secret，向微信官方换取真实的 openid
  if (appId && appSecret && code !== 'mock_code') {
    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
      const wxRes = await fetch(url);
      const wxData = await wxRes.json();

      if (wxData.openid) {
        openid = wxData.openid;
      } else {
        console.warn('[WeChat Auth] 官方换码异常:', wxData);
        return res.status(400).json({ success: false, message: wxData.errmsg || '微信登录失败' });
      }
    } catch (e) {
      console.error('[WeChat Auth] 网络请求失败:', e);
      return res.status(500).json({ success: false, message: '无法连接微信验证服务器' });
    }
  } else {
    // # 本地调试/尚未填入 AppSecret 时自动生成稳定 mock openid，保证开箱即用不卡死
    openid = `dev_openid_${Buffer.from(code).toString('hex').slice(0, 16)}`;
    console.log('[WeChat Auth] 使用自适应测试 OpenID:', openid);
  }

  // # 保存/更新用户信息
  const user = db.saveUser({ openid, nickname, avatar });

  // # 签发 30 天有效期的 JWT
  const token = jwt.sign({ openid }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    token,
    openid,
    user
  });
});

// # 2. 图片/效果图上传接口 (替代云存储 uploadFile，并接入微信 imgSecCheck 实时拦截)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未收到上传的文件' });
  }

  // 微信图片内容安全检测
  try {
    const imgCheck = await security.checkImageSecurity(req.file.path);
    if (!imgCheck.safe) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        code: 87014,
        message: imgCheck.reason || '图片包含违法违规或不当信息，已被系统拦截'
      });
    }
  } catch (err) {
    console.warn('[Security] 图片检测异常:', err.message);
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

  res.json({
    success: true,
    url: relativeUrl,
    fullUrl,
    fileID: relativeUrl,
    filename: req.file.filename
  });
});

// # 3. 保存拼豆图纸 (替代 savePattern 云函数，并接入微信 msgSecCheck 标题检测)
app.post('/api/patterns', async (req, res) => {
  const openid = req.user?.openid || req.body.openid || 'guest_user';
  const {
    name = '未命名拼豆手作',
    gridData = [],
    paletteBrand = 'MARD',
    width = 50,
    height = 50,
    previewUrl = '',
    isPublic = false,
    authorName = '拼豆创作者',
    authorAvatar = ''
  } = req.body;

  if (!gridData || gridData.length === 0) {
    return res.status(400).json({ success: false, message: '图纸网格数据不能为空' });
  }

  // 微信文本内容安全检测 (Scene 1: 标题/资料)
  if (name && name.trim()) {
    try {
      const textCheck = await security.checkTextSecurity(name, openid, 1);
      if (!textCheck.safe) {
        return res.status(400).json({
          success: false,
          code: 87014,
          message: textCheck.reason || '图纸名称包含违法违规或不当信息，请修改后重试'
        });
      }
    } catch (err) {
      console.warn('[Security] 图纸标题安全检测异常:', err.message);
    }
  }

  const pattern = db.savePattern({
    openid,
    name,
    gridData,
    paletteBrand,
    width,
    height,
    previewUrl,
    isPublic,
    authorName,
    authorAvatar
  });

  res.json({
    success: true,
    id: pattern.id,
    data: pattern,
    message: '图纸已成功存入作品集'
  });
});

// # 4. 查询图纸列表 (替代 getPatternList 云函数)
app.get('/api/patterns', (req, res) => {
  const type = req.query.type || 'my'; // 'my' | 'community'
  const sortBy = req.query.sortBy || 'createTime'; // 'createTime' | 'likes'
  const limit = parseInt(req.query.limit) || 60;
  const openid = req.user?.openid || req.query.openid || '';

  const list = db.getPatternList({ type, openid, sortBy, limit });

  res.json({
    success: true,
    data: list
  });
});

// # 5. 获取单张图纸详情与评论 (替代 getPatternDetail 云函数)
app.get('/api/patterns/:id', (req, res) => {
  const { id } = req.params;
  const pattern = db.getPatternDetail(id);

  if (!pattern) {
    return res.status(404).json({ success: false, message: '图纸不存在或已被删除' });
  }

  res.json({
    success: true,
    data: pattern
  });
});

// # 6. 删除指定图纸 (替代 deletePattern 云函数)
app.delete('/api/patterns/:id', (req, res) => {
  const { id } = req.params;
  const openid = req.user?.openid || '';

  const success = db.deletePattern(id, openid);

  if (success) {
    res.json({ success: true, message: '图纸已成功删除' });
  } else {
    res.status(400).json({ success: false, message: '删除失败或无权操作该图纸' });
  }
});

// # 7. 切换公开 / 私密 (替代 togglePublish 云函数)
app.put('/api/patterns/:id/publish', (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body;
  const openid = req.user?.openid || '';

  const success = db.togglePublish(id, isPublic, openid);

  if (success) {
    res.json({ success: true, message: '发布状态更新成功' });
  } else {
    res.status(400).json({ success: false, message: '更新失败或无权操作该图纸' });
  }
});

// # 8. 社区图纸点赞自增 (替代 likePattern 云函数)
app.post('/api/patterns/:id/like', (req, res) => {
  const { id } = req.params;
  const likes = db.likePattern(id);

  res.json({
    success: true,
    likes,
    message: '点赞成功'
  });
});

// # 9. 记录图纸开拼/下载自增 (替代 recordDownload 云函数)
app.post('/api/patterns/:id/download', (req, res) => {
  const { id } = req.params;
  db.recordDownload(id);

  res.json({
    success: true,
    message: '开拼记录更新成功'
  });
});

// # 10. 发表图纸评论 (替代 addComment 云函数，并接入微信 msgSecCheck 评论检测)
app.post('/api/patterns/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { content, authorName = '拼豆玩家', authorAvatar = '' } = req.body;
  const openid = req.user?.openid || 'guest';

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: '评论内容不能为空' });
  }

  // 微信文本内容安全检测 (Scene 2: 评论)
  try {
    const textCheck = await security.checkTextSecurity(content, openid, 2);
    if (!textCheck.safe) {
      return res.status(400).json({
        success: false,
        code: 87014,
        message: textCheck.reason || '评论内容包含违法违规或不当信息，已被系统拦截'
      });
    }
  } catch (err) {
    console.warn('[Security] 评论文本安全检测异常:', err.message);
  }

  const comment = db.addComment(id, {
    openid,
    authorName,
    authorAvatar,
    content
  });

  if (!comment) {
    return res.status(404).json({ success: false, message: '图纸不存在' });
  }

  res.json({
    success: true,
    data: comment,
    message: '评论发表成功'
  });
});

// # 11. 微信内容安全整改：存量数据一键排查清理接口
app.post('/api/admin/clean-test-data', (req, res) => {
  const count = db.cleanAllComments();
  res.json({
    success: true,
    cleanedComments: count,
    message: '存量历史评论与可能存在的违规测试数据已彻底清空排查'
  });
});

// # 全局 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// # 启动服务
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 拼豆工坊自建 API 后端已启动: http://0.0.0.0:${PORT}`);
  console.log(`📦 图片静态资源目录: ${UPLOAD_DIR}`);
  console.log(`🛡️ 鉴权环境: JWT Enabled`);
  console.log(`===============================================`);
});
