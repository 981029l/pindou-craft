# PinDou Atelier 微信小程序版 (原生云开发 1:1 复刻)

> **基于微信原生架构 (Canvas 2D + 云开发 + 流体 TabBar) 的高颜值智能拼豆图纸工坊**

---

## 📱 项目架构与特性

1. **微信原生 Canvas 2D 硬件加速**：
   - 逐格渲染 MARD 221 / Perler 80 / Artkal 160 标准色卡微珠质感与平面像素；
   - 支持**双指缩放、360° 漫游拖拽、双击 350% 焦点对焦与实时坐标探针**；
2. **三工坊独立流体 TabBar 架构**：
   - 🎨 **工作台**：原图载入、规格配置、Procreate 级极简工具栏、Canvas 编辑与 BOM 双拼胶囊矩阵；
   - 🌐 **社区广场**：全网精彩图纸探索、最新/热门排序、动态点赞、一键载入工作台二次创作；
   - 👤 **我的中心**：创作者徽章、我的作品集管理、一键【发布到社区/设为私密】与删除管理；
3. **微信官方 `cover-view` 硬件同层流体胶囊 TabBar**：
   - 彻底压制 Canvas 2D 穿透，天然绝对置顶；
   - 搭载物理 Squash & Stretch 流体拉伸与 Spring 阻尼过冲回弹；
4. **微信云开发 (Cloud Base) 触发式静默同步**：
   - 天然免鉴权绑定用户微信 OpenID，100% 符合微信审核规范；
   - 图纸数据自动同步至云数据库集合 `patterns`。

---

## 🛠️ 云开发与云函数配置指引 (全流程步骤)

### 第 1 步：开通云开发环境
1. 打开 **微信开发者工具**，确保顶部项目 AppID 为您自己的小程序 AppID（或测试号）；
2. 点击微信开发者工具顶部工具栏中的 **【云开发】** 图标按钮；
3. 按照提示点击“开通”，创建一个免费的云开发环境（例如命名为 `pindou-env`）；
4. 记录下您的 **【环境 ID】**（在云开发控制台概览中可查看）。

### 第 2 步：创建数据库集合 `patterns`
1. 在云开发控制台顶部点击 **【数据库】** 标签页；
2. 在左侧“集合名称”旁边点击 **【+】（添加集合）**；
3. 集合名称输入：`patterns`，点击确定；
4. 点击 `patterns` 集合右上角的 **【权限设置】**，选择：
   - **所有用户可读，仅创建者可写**（或直接选择“所有用户可读写”），点击保存。

### 第 3 步：一键上传并部署 6 大云函数
在微信开发者工具左侧的文件管理器中，展开 `cloudfunctions/` 目录：
1. 右键点击 `savePattern` ➔ 选择 **【上传并部署：云端安装依赖 (不上传 node_modules)】**；
2. 右键点击 `getPatternList` ➔ 选择 **【上传并部署：云端安装依赖 (不上传 node_modules)】**；
3. 右键点击 `togglePublish` ➔ 选择 **【上传并部署：云端安装依赖 (不上传 node_modules)】**；
4. 右键点击 `likePattern` ➔ 选择 **【上传并部署：云端安装依赖 (不上传 node_modules)】**；
5. 右键点击 `deletePattern` ➔ 选择 **【上传并部署：云端安装依赖 (不上传 node_modules)】**；
6. 右键点击 `imgSecCheck` ➔ 选择 **【上传并部署：云端安装依赖 (不上传 node_modules)】**。

> 💡 提示：部署成功后，各个云函数文件夹图标上会出现一个绿色的云朵标识，即表示云端生效完成！

### 第 4 步：编译运行
点击微信开发者工具顶部的 **【编译】** 按钮（或按 `Ctrl + R`），即可在工作台自由创作、存入云端并发布到社区！

---

## 📁 目录结构

```
d:\pindou\小程序/
├── cloudfunctions/             # 微信云开发服务端 (8 大核心云函数)
│   ├── savePattern/            # 保存图纸并生成/绑定效果图快照
│   ├── getPatternList/         # 查询作品集 (支持 my 与 community 排序双模式)
│   ├── getPatternDetail/       # 获取单张图纸详情与评论列表
│   ├── addComment/             # 发表图纸手作评论 (绑定作者昵称)
│   ├── recordDownload/         # 图纸开拼下载次数原子累加
│   ├── togglePublish/          # 切换图纸在社区中公开/私密状态
│   ├── likePattern/            # 社区图纸点赞原子递增
│   ├── deletePattern/          # 安全物理删除指定图纸
│   └── imgSecCheck/            # 微信官方图片内容安全审核
│
├── miniprogram/                # 小程序客户端
│   ├── app.js / app.json / app.wxss
│   ├── pages/
│   │   ├── index/              # 【工作台】画布编辑、原图生成与云端快照保存
│   │   ├── community/          # 【社区广场】画廊效果图瀑布流与快捷开拼
│   │   ├── detail/             # 【图纸详情】高清画廊大图、创作者名片、点赞下载与评论区
│   │   ├── collection/         # 【二级作品图库】双轨流体瀑布流、全量图纸搜索与多维分类管理
│   │   ├── mine/               # 【我的作品集】创作者名片中枢、近期作品流与全览管理
│   │   └── export/             # 【导出中心】A4 拼豆色号图纸生成与导出
│   ├── utils/
│   │   ├── policyHelper.js     # 微信官方合规用户服务协议与隐私保护指引
│   │   ├── thumbnailHelper.js  # 离屏画布拼豆微缩图极速自愈引擎
│   │   ├── mardPalette.js      # MARD 221 标准色库
│   │   ├── paletteManager.js   # 多品牌色库中心
│   │   ├── colorQuantizer.js   # CIEDE2000 色差量化算法
│   │   ├── imageProcessor.js   # Canvas 2D 图像采样
│   │   └── exportHelper.js     # A4 图纸与 BOM 工具
│   ├── components/
│   │   ├── canvas-editor/      # 原生 Canvas 2D 交互编辑器
│   │   ├── bom-matrix/         # 双拼用料胶囊矩阵
│   │   └── quick-palette/      # 底部抽屉快捷调色盘
│   └── pages/
│       ├── index/              # 工作台
│       ├── community/          # 社区广场
│       ├── mine/               # 我的中心 (作品集管理)
│       └── export/             # A4 图纸与 BOM 导出
└── project.config.json
```

---

## 📄 许可证
MIT License © 2026 PinDou Craft Studio
