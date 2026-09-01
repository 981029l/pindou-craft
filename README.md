# PinDou Craft Studio (拼豆创想工坊)

> **基于 MARD 221 标准色卡的高颜值智能拼豆图纸生成与交互工坊**
> 
> *Photo / AI Prompt to Perler Bead Pattern & Bill of Materials (BOM) in One Breath.*

---

## ✨ 核心功能与亮点

1. **双模图纸生成管线**：
   - **本地照片转拼豆**：无需配置 Key，拖拽任意图片（JPG/PNG/WebP），自动按比例缩放并自适应下采样；
   - **AI 灵感文生图**：支持输入自然语言（如“赛博朋克猫咪”、“像素皮卡丘”），自动编译专业像素 Prompt 并调用 AI 模型生成。
2. **MARD 221 标准色卡与 CIEDE2000 色彩量化**：
   - 内置全量 221 种 MARD 色号（包含 HEX、RGB、CIE-Lab 数据）；
   - 基于 CIEDE2000 空间色差计算算法，精确模拟人眼感知；
   - 支持最大用色数限制（12~36 色聚类）与背景抠除模式（保留/挖空/纯色）。
3. **用户自定义 AI 端点与 Key**：
   - 支持自由配置 `API Base URL`（如 OpenAI 官方 `https://api.openai.com/v1`、便携 AI `https://api.bianxie.ai/v1`、OneAPI 等中转）；
   - 支持自定义模型（`gpt-image-2`, `dall-e-3`, `gpt-image-1` 等）；
   - 配置严格存储在本地浏览器（`localStorage`），安全零泄露。
4. **专业级 Canvas 交互画布**：
   - 画笔、油漆桶泛洪填充、吸管拾色、橡皮擦；
   - **同色一键高亮**：点击任意色号，自动暗化其余豆子，辅助实体拼豆极速找色；
   - 视口手势平移、缩放（50%~350%）、网格线与色号角标开关、3D 拟物拼豆 / 平面像素双样式切换；
   - 完备的撤销 / 重做（Ctrl+Z / Ctrl+Y）。
5. **工业级图纸与物料导出**：
   - **A4 可打印高清图纸 (PNG)**：包含坐标刻度、色号角标与底部采购对照表；
   - **矢量图纸 (SVG)**：无损矢量格式；
   - **BOM 采购清单 (CSV / 剪贴板)**：包含色号代码、中文名、HEX 颜色、系列与所需颗粒数。

---

## 🚀 本地快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始创作！

### 3. 构建生产包
```bash
npm run build
```

---

## 📁 目录结构

```
pindou/
├── index.html                # 入口 HTML
├── package.json              # 项目依赖与脚本
├── vite.config.js            # Vite 配置文件
├── tailwind.config.js        # 潮玩毛玻璃主题与色彩扩展
├── src/
│   ├── main.jsx              # React 应用主入口
│   ├── App.jsx               # 工作台布局与状态流转中心
│   ├── index.css             # 弥散渐变光晕与拼豆拟物质感样式
│   ├── config/
│   │   └── apiConfig.js      # 全局 AI 配置与本地存储管理中心
│   ├── data/
│   │   ├── mardPalette.js    # MARD 221 色卡全量数据与预计算 Lab 空间值
│   │   └── samplePresets.js  # 热门预置拼豆图纸 (皮卡丘、超级蘑菇、像素心动)
│   ├── core/
│   │   ├── colorQuantizer.js # CIEDE2000 色差计算与色数收敛算法
│   │   ├── imageProcessor.js # 图像网格采样与背景抠除管线
│   │   └── aiService.js      # OpenAI 协议兼容生图调度器
│   └── components/
│       ├── Navbar.jsx        # 顶部导航、品牌与快速操作
│       ├── GlassCard.jsx     # 毛玻璃卡片通用容器
│       ├── SettingsModal.jsx # 自定义 AI URL 与 Key 配置弹窗
│       ├── CreationPanel.jsx # 照片上传与 AI 灵感生成控制台
│       ├── CanvasEditor.jsx  # 核心交互画布与绘图工具箱
│       ├── PaletteSidebar.jsx# BOM 耗材统计与 221 色卡浏览器
│       ├── ExportModal.jsx   # A4 高清打印图纸与 CSV 物料导出
│       └── PresetGallery.jsx # 热门模版选择弹窗
└── README.md
```

---

## 📄 开源许可
MIT License
