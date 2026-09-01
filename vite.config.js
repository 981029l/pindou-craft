import { defineConfig } from 'vite'; // 导入 Vite 配置方法
import react from '@vitejs/plugin-react'; // 导入 React 插件

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // 启用 React 插件
  server: {
    port: 3000, // 本地开发端口 3000
    open: true, // 启动时自动打开浏览器
  },
});
