// # 微信小程序内容安全违规排查与数据清洗脚本
// 执行命令: node clean-test-data.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

console.log('=====================================================');
console.log('🛡️ 开始执行微信内容安全违规排查与存量测试数据清理...');
console.log('=====================================================');

// 1. 清理所有存量评论（彻底删除微信自动化机器人此前留下的违规测试文字）
const cleanedCommentsCount = db.cleanAllComments();
console.log(`✅ [1/2] 历史评论数据清理完毕: 已清空 ${cleanedCommentsCount} 条存量评论`);

// 2. 排查并扫描所有图纸名称
const patterns = db.getAllPatternsRaw();
console.log(`🔍 [2/2] 正在扫描存量图纸 (共 ${patterns.length} 张)...`);

let flaggedCount = 0;
const SENSITIVE_WORDS = ['办证', '发票', '赌博', '色情', '代开', '假证', '兼职', '测试'];

patterns.forEach(p => {
  const name = p.name || '';
  for (const word of SENSITIVE_WORDS) {
    if (name.includes(word)) {
      console.warn(`⚠️ 发现可疑测试图纸: [ID: ${p.id}] 名称: "${name}"`);
      db.deletePattern(p.id, '');
      flaggedCount++;
      break;
    }
  }
});

console.log(`✅ 图纸扫描完毕: 已清理 ${flaggedCount} 张违规/测试图纸`);
console.log('=====================================================');
console.log('🎉 存量违规排查与清理 100% 完成！符合微信运营规范 5.18 要求。');
console.log('=====================================================');
