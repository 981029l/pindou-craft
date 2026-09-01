// 预置高品质热门拼豆模板 (包含标准 MARD 色号矩阵，支持开箱即玩)

// 生成纯色或空网格辅助函数
function createEmptyGrid(w, h) {
  return Array.from({ length: h }, () => Array(w).fill('EMPTY'));
}

// 1. 经典像素爱心 (16x16)
function generateHeartPreset() {
  const grid = createEmptyGrid(16, 16);
  const heartShape = [
    [0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0],
    [0,1,2,2,2,1,0,1,2,2,2,1,0,0,0,0],
    [1,2,3,2,2,2,1,2,2,2,2,2,1,0,0,0],
    [1,2,3,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  ];
  for (let r = 0; r < heartShape.length; r++) {
    for (let c = 0; c < 16; c++) {
      const val = heartShape[r][c];
      if (val === 1) grid[r + 2][c] = 'H7'; // 纯黑描边
      if (val === 2) grid[r + 2][c] = 'F4'; // 亮红
      if (val === 3) grid[r + 2][c] = 'H1'; // 纯白高光
    }
  }
  return grid;
}

// 2. 经典马里奥小蘑菇 (16x16)
function generateMushroomPreset() {
  const grid = createEmptyGrid(16, 16);
  const pattern = [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,2,2,2,2,3,3,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,3,3,3,3,2,1,0,0],
    [0,1,2,2,3,3,2,2,3,3,3,3,2,2,1,0],
    [0,1,2,3,3,3,3,2,2,3,3,2,2,2,1,0],
    [1,2,2,3,3,3,3,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,3,3,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,1,4,4,1,4,4,1,4,4,1,0,0,0],
    [0,0,0,1,4,4,1,4,4,1,4,4,1,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  ];
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < 16; c++) {
      const val = pattern[r][c];
      if (val === 1) grid[r + 1][c] = 'H7'; // 黑色
      if (val === 2) grid[r + 1][c] = 'F15'; // 正红
      if (val === 3) grid[r + 1][c] = 'H1'; // 白色斑点
      if (val === 4) grid[r + 1][c] = 'G1'; // 浅肤色柄
    }
  }
  return grid;
}

// 3. 萌趣皮卡丘头像 (20x20)
function generatePikachuPreset() {
  const grid = createEmptyGrid(20, 20);
  // 耳朵与脸颊轮廓
  const ears = [
    { r: 1, c: 2, code: 'H7' }, { r: 1, c: 3, code: 'H7' }, { r: 2, c: 3, code: 'A4' }, { r: 3, c: 4, code: 'A4' },
    { r: 1, c: 17, code: 'H7' }, { r: 1, c: 16, code: 'H7' }, { r: 2, c: 16, code: 'A4' }, { r: 3, c: 15, code: 'A4' }
  ];
  ears.forEach(p => { if (grid[p.r] && grid[p.r][p.c]) grid[p.r][p.c] = p.code; });

  // 脸部填充 (5~15 行)
  for (let r = 4; r <= 16; r++) {
    for (let c = 4; c <= 15; c++) {
      grid[r][c] = 'A4'; // 亮黄色主体
    }
  }
  // 描边与腮红五官
  grid[7][6] = 'H7'; grid[7][7] = 'H1'; // 左眼
  grid[7][13] = 'H7'; grid[7][12] = 'H1'; // 右眼
  grid[9][9] = 'H7'; grid[9][10] = 'H7'; // 鼻子
  grid[10][6] = 'F4'; grid[10][7] = 'F4'; grid[11][6] = 'F4'; // 左红脸蛋
  grid[10][12] = 'F4'; grid[10][13] = 'F4'; grid[11][13] = 'F4'; // 右红脸蛋
  grid[12][9] = 'F19'; grid[12][10] = 'F19'; // 嘴巴

  return grid;
}

// 预设列表清单
export const PRESET_GALLERY = [
  {
    id: 'heart',
    name: '像素心动 (Pixel Heart)',
    category: '经典潮流',
    width: 16,
    height: 16,
    tags: ['新手推荐', '浪漫', '16格'],
    grid: generateHeartPreset(),
  },
  {
    id: 'mushroom',
    name: '超级蘑菇 (Super Mushroom)',
    category: '游戏复古',
    width: 16,
    height: 16,
    tags: ['8-Bit', '经典马里奥', '16格'],
    grid: generateMushroomPreset(),
  },
  {
    id: 'pikachu',
    name: '电系萌宠 (Pikachu Face)',
    category: '动漫二次元',
    width: 20,
    height: 20,
    tags: ['宝可梦', '萌趣', '20格'],
    grid: generatePikachuPreset(),
  },
];
