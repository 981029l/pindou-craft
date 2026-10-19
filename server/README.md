# 拼豆工坊自建独立后端 (PinDou API Server)

专为微信小程序打造的高性能独立 Node.js 后端服务，彻底替代微信官方按月扣费的云开发（CloudBase）和云函数。

## 🌟 核心特性
- **永久 0 成本**：运行于您自己的 Linux 服务器，不再缴纳任何云开发套餐费。
- **开箱即用**：支持 SQLite 与本地 JSON 文件双引擎，无需安装复杂的数据库。
- **图片独立托管**：图纸作品缩略图直接保存在服务器硬盘（`uploads/` 目录），通过 Nginx 或 Express 高速分发。
- **全功能对齐**：完整支持用户登录、图纸保存、广场列表检索、点赞、评论、下载统计与公开/私密切换。

---

## 🚀 部署指南 (Linux / 宝塔)

### 1. 安装依赖并启动
```bash
# 进入服务端目录
cd /www/pindou-api/pindou-craft/server

# 复制配置文件
cp .env.example .env

# 安装依赖
npm install

# 使用 PM2 启动服务 (后台常驻守护，崩溃自动重启)
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status
pm2 logs pindou-api
```

---

### 2. Nginx 反向代理配置
如果您在服务器上使用 Nginx 或宝塔面板，可在站点配置中加入以下反向代理规则：

```nginx
# 代理后端 API
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# 代理图纸上传的静态图片
location /uploads/ {
    proxy_pass http://127.0.0.1:3001/uploads/;
    proxy_set_header Host $host;
    expires 30d;
}
```

配置后重新加载 Nginx：
```bash
nginx -s reload
```

---

### 3. 小程序对接配置
在小程序代码 `miniprogram/config.js` 中填入您的服务器域名：
```javascript
module.exports = {
  API_BASE_URL: 'https://您的域名/api',
  IMAGE_BASE_URL: 'https://您的域名'
};
```
并在微信公众平台后台将您的域名加入【开发管理】->【开发设置】->【服务器域名】的 `request` 与 `uploadFile` 合法域名列表中。
