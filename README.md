# PinDou Craft Studio (拼豆创想工坊)

<div align="center">

[![Online Demo](https://img.shields.io/badge/🌐_Online_Demo-pindou.lvky.cn-F59E0B?style=for-the-badge&logo=googlechrome&logoColor=white)](https://pindou.lvky.cn/)

![Version](https://img.shields.io/badge/version-v1.2.0-amber.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**基于 MARD 221 / Perler / Artkal 标准色卡的高颜值智能拼豆图纸生成与工业级交互工坊**

*Photo / AI Prompt to Perler Bead Pattern & Bill of Materials (BOM) in One Breath.*

[🌐 立即体验 (在线演示: pindou.lvky.cn)](https://pindou.lvky.cn/) • [📖 使用指南](./INSTRUCTION.md) • [📅 更新日志](#-版本发布记录-changelog) • [✨ 功能特性](#-核心功能与亮点)

</div>

---

## ✨ 核心功能与亮点

### 1. 🎨 双模图纸生成管线
- **原图直接生成图纸 (本地极速 1:1 直出)**：无需配置网络与 Key，拖拽任意图片（JPG / PNG / WebP），毫秒级自动按比例网格采样与 CIEDE2000 色彩量化；
- **AI 智能重绘图纸 (灵感生图与智能重构)**：支持输入自然语言（如“赛博朋克猫咪”、“像素皮卡丘”），自动编译专业像素 Prompt 并调用 AI 模型生成。

### 2. 💎 全球三大拼豆品牌色库与 Lab 色彩空间预计算
- **MARD (221 色)**、**Perler (80 色)**、**Artkal (160 色)** 全色谱数据内置；
- 基于 **CIEDE2000** 空间色差计算算法，精确模拟人眼感知；
- 支持最大用色数限制（12~48 色聚类）与背景抠除模式（保留 / 挖空 / 纯色）。

### 3. 🖌️ 专业级 Canvas 交互画布与全端适配
- **工具箱**：画笔、油漆桶泛洪填充、吸管拾色、橡皮擦、专属抓手漫游工具；
- **画笔胶囊即刻快捷调色盘 (Quick Palette Popover & Bottom Sheet)**：
  - 点击画笔胶囊 `[ 🎨 画笔: 色号 ▾ ]`，即刻唤起快捷调色盘；
  - **移动端**：原生 App 级 100% 纯白底部抽屉 (Bottom Sheet)，大拇指触手可及；
  - **PC 桌面端**：精准悬浮纯白气泡，点击外部遮罩或按键秒速收起；
  - **📌 本图已用色优先置顶**：图纸已有颜色排在最前，一键秒切；
  - **全量色库与模糊搜索**：支持输入色号（如 `H07`）或中文名称（如 `红`、`蓝`、`黑`）实时过滤；
- **全向自由漫游平移 (360° Pan)**：放大后支持**鼠标右键拖拽 / 鼠标中键 / 空格+拖拽 / 抓手工具**，向任意方向平滑移动视口；
- **滚轮缩放控制开关与防误触**：默认滚轮正常滚动网页，提供右下角【滚轮缩放 开/关】切换与 `Ctrl + 滚轮` 局部智能缩放；
- **双击/双触即刻微距聚焦 (Double-Tap Focus)**：在画面任意位置双击瞬间放大至 350% 聚焦当前局部，再次双击一键还原全景；
- **悬浮实时格点坐标探针**：鼠标划过或手指触碰任意豆子，实时弹出 `📍 (X, Y) | 色号与品名` 信息胶囊；
- **竞品级双拼用料胶囊矩阵**：画布正下方常驻展示【左侧色块色号 + 右侧白底颗数】双色拼接卡片，点击任意色号**全图一键高亮找色**（其余颜色自动暗化 88%）；
- **工业级 5×5 / 10×10 加粗网格分块**：每 5 格中粗、每 10 格加粗分块，完全对齐实体拼豆物理插板找位习惯；
- **移动端沉浸式双标签切换**：手机端在【控制与调色】与【图纸与画布】间无缝切换，独占全屏，零横向滚动条；
- 完备的撤销 / 重做（Ctrl+Z / Ctrl+Y）与高光微珠 / 平面像素 / 打孔插板 3 种质感切换。

### 4. 🔒 用户自定义 AI 端点与 Key (安全零泄露)
- 默认 API Key 为空，公网部署时绝不暴露站长私有凭据与额度；
- 支持自由配置 `API Base URL`（如 OpenAI 官方 `https://api.openai.com/v1`、便携 AI `https://api.bianxie.ai/v1`、OneAPI 等中转）；
- 支持自定义模型（`gpt-image-2`, `dall-e-3`, `gpt-image-1` 等）；
- 访客填写的 API Key 严格保存在其各自的本地浏览器（`localStorage`），绝不上传服务器。

### 5. 📄 工业级图纸与物料导出
- **A4 可打印高清图纸 (PNG)**：包含坐标刻度、5×5/10×10 加粗网格、色号角标与底部标准双拼 BOM 用料对照表；
- **矢量图纸 (SVG)**：无损矢量格式；
- **BOM 采购清单 (CSV / 剪贴板)**：包含色号代码、中文名、HEX 颜色、系列与所需颗粒数。

---

## 🚀 本地快速启动

### 1. 克隆与安装依赖
```bash
# 进入项目目录
cd pindou

# 安装依赖
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始创作！

### 3. 构建生产部署包
```bash
npm run build
```
打包输出至 `dist/` 目录，可直接部署至任意静态托管平台（Vercel、Netlify、Cloudflare Pages、Nginx 等）。

---

## 📅 版本发布记录 (Changelog)

### [v1.2.0] - 2026-09-02
- 🎨 **画笔快捷选色坞上线**：点击底部画笔胶囊 `[ 🎨 画笔: 色号 ▾ ]`，即刻唤起全量色号网格与实时搜索；
- 📱 **移动端底部抽屉 (Bottom Sheet)**：移动端采用 100% 纯白实体沉浸卡片与半透明遮罩，彻底杜绝透底重影，大拇指操作触手可及；
- 📌 **本图已用色优先置顶**：快速调色盘最上方置顶展示图纸已有色号，手工修色效率翻倍；
- 🕹️ **交互文案工匠级精简**：主按钮优化为【✨ AI 智能重绘图纸】，次按钮优化为【⚡ 原图直接生成图纸】；
- 📐 **默认视图体验优化**：默认取消刻度标尺选中，移除多余重置按钮，界面更加清爽聚焦；
- 📦 **依赖与工程构建升级**：版本号升级至 v1.2.0，全量静态资源与构建性能优化。

### [v1.1.0] - 2026-09-02
- 🔍 **焦点智能缩放与双击微距对焦**：光标/触点为中心智能放大，双击瞬间对焦至 350%；
- 🖱️ **滚轮缩放控制开关与防误触**：默认滚轮正常滚动网页，支持按键切换与 `Ctrl + 滚轮` 快捷缩放；
- 🧭 **360° 全向漫游平移**：支持鼠标右键拖拽、鼠标中键拖拽、空格键拖拽与专属抓手工具；
- 🧩 **竞品级双拼用料胶囊矩阵**：画布正下方常驻双色拼接 BOM 矩阵与全图高亮找色联动；
- 📱 **移动端沉浸式双标签切换**：优化移动端视口，杜绝横向滚动条。

### [v1.0.0] - 2026-09-01
- 🚀 **PinDou Craft Studio 初始版本发布**；
- 🎨 支持本地图片转拼豆、AI 生图与 CIEDE2000 色彩量化；
- 📄 支持 A4 高清图纸与 CSV 物料导出。

---

## 📁 目录结构

```
pindou/
├── index.html                # 入口 HTML
├── package.json              # 项目依赖与脚本 (v1.2.0)
├── vite.config.js            # Vite 配置文件
├── tailwind.config.js        # 潮玩毛玻璃主题与色彩扩展
├── INSTRUCTION.md            # 详尽使用与部署操作手册
├── src/
│   ├── main.jsx              # React 应用主入口
│   ├── App.jsx               # 工作台布局与状态流转中心
│   ├── index.css             # 弥散渐变光晕与拼豆拟物质感样式
│   ├── assets/
│   │   └── default_sample.webp # 默认示范高清底图
│   ├── config/
│   │   └── apiConfig.js      # 全局 AI 配置与本地存储管理中心
│   ├── data/
│   │   ├── mardPalette.js    # MARD 221 色卡全量数据与预计算 Lab 空间值
│   │   ├── paletteManager.js # 多品牌色卡管理中心 (MARD/Perler/Artkal)
│   │   └── samplePresets.js  # 热门预置拼豆图纸
│   ├── core/
│   │   ├── colorQuantizer.js # CIEDE2000 色差计算与色数收敛算法
│   │   ├── imageProcessor.js # 图像网格采样与背景抠除管线
│   │   └── aiService.js      # OpenAI 协议兼容生图调度器
│   └── components/
│       ├── Navbar.jsx        # 顶部导航、品牌与快速操作
│       ├── GlassCard.jsx     # 毛玻璃卡片通用容器
│       ├── SettingsModal.jsx # 自定义 AI URL 与 Key 配置弹窗
│       ├── OriginalImageCard.jsx # 原图上传、AI 重构与执行按键
│       ├── ParameterSettingsCard.jsx # 尺寸、滤镜与色谱参数控制台
│       ├── CanvasEditor.jsx  # 核心交互画布、调色盘与绘图工具箱
│       ├── PatternPreviewHeader.jsx # 视图模式与图纸动作栏
│       └── ExportModal.jsx   # A4 高清打印图纸与 CSV 物料导出
└── README.md
```

---

## 📄 开源许可
MIT License © 2026 PinDou Craft Studio
