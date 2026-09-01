/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atelier: {
          bg: '#f6f7f6', // 日系工坊暖白底色
          card: '#ffffff', // 纯白工作台卡片
          border: '#e4e7e5', // 细腻工匠边界线
          dark: '#1e232a', // 深炭黑文本
          muted: '#6b7280', // 柔和次级文本
          amber: '#d97706', // 暖木琥珀点缀
          accent: '#2563eb', // 纯净工坊蓝
        }
      },
      boxShadow: {
        'atelier': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'atelier-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'atelier-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'pegboard': 'inset 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'bead-real': '0 2px 4px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.6)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
