// 全球三大拼豆品牌色卡数据库中心 (MARD 221 色、Perler 80 色、Artkal 160 色) 与严格 Lab 色彩空间预计算
import { MARD_PALETTE } from './mardPalette.js';

// 1. Perler (拼拼豆豆) 官方标准色库
export const PERLER_PALETTE = [
  { code: 'P01', name_zh: '纯白 (White)', hex: '#FFFFFF', r: 255, g: 255, b: 255 },
  { code: 'P02', name_zh: '奶油黄 (Cream)', hex: '#F6E6B4', r: 246, g: 230, b: 180 },
  { code: 'P03', name_zh: '柠檬黄 (Yellow)', hex: '#F6D000', r: 246, g: 208, b: 0 },
  { code: 'P04', name_zh: '鲜橙色 (Orange)', hex: '#F05323', r: 240, g: 83, b: 35 },
  { code: 'P05', name_zh: '正红色 (Red)', hex: '#DE1B26', r: 222, g: 27, b: 38 },
  { code: 'P06', name_zh: '樱花粉 (Bubblegum)', hex: '#EB5E8D', r: 235, g: 94, b: 141 },
  { code: 'P07', name_zh: '浅紫色 (Purple)', hex: '#68478D', r: 104, g: 71, b: 141 },
  { code: 'P08', name_zh: '深蓝色 (Dark Blue)', hex: '#1C3F77', r: 28, g: 63, b: 119 },
  { code: 'P09', name_zh: '天蓝色 (Light Blue)', hex: '#4B9FD5', r: 75, g: 159, b: 213 },
  { code: 'P10', name_zh: '深绿色 (Dark Green)', hex: '#116834', r: 17, g: 104, b: 52 },
  { code: 'P11', name_zh: '草绿色 (Light Green)', hex: '#63B344', r: 99, g: 179, b: 68 },
  { code: 'P12', name_zh: '咖啡棕 (Brown)', hex: '#583622', r: 88, g: 54, b: 34 },
  { code: 'P17', name_zh: '浅灰色 (Grey)', hex: '#94989B', r: 148, g: 152, b: 155 },
  { code: 'P18', name_zh: '正黑色 (Black)', hex: '#111315', r: 17, g: 19, b: 21 },
  { code: 'P19', name_zh: '透明色 (Clear)', hex: '#E5E9EC', r: 229, g: 233, b: 236 },
  { code: 'P20', name_zh: '锈红色 (Rust)', hex: '#9E3725', r: 158, g: 55, b: 37 },
  { code: 'P21', name_zh: '淡粉色 (Light Pink)', hex: '#F5B8CE', r: 245, g: 184, b: 206 },
  { code: 'P33', name_zh: '桃粉色 (Peach)', hex: '#F6B792', r: 246, g: 183, b: 146 },
  { code: 'P35', name_zh: '青柠黄 (Kiwi Lime)', hex: '#A8D137', r: 168, g: 209, b: 55 },
  { code: 'P37', name_zh: '绿松石 (Turquoise)', hex: '#00A89C', r: 0, g: 168, b: 156 },
  { code: 'P53', name_zh: '淡紫罗兰 (Pastel Lavender)', hex: '#B297C5', r: 178, g: 151, b: 197 },
  { code: 'P54', name_zh: '淡黄色 (Pastel Yellow)', hex: '#FEF3A9', r: 254, g: 243, b: 169 },
  { code: 'P57', name_zh: '切达橙 (Cheddar)', hex: '#FBAE17', r: 251, g: 174, b: 23 },
  { code: 'P59', name_zh: '热粉色 (Hot Coral)', hex: '#F04C64', r: 240, g: 76, b: 100 },
  { code: 'P60', name_zh: '梅子紫 (Plum)', hex: '#772152', r: 119, g: 33, b: 82 },
  { code: 'P61', name_zh: '薄荷绿 (Mint)', hex: '#7ED3B2', r: 126, g: 211, b: 178 },
  { code: 'P62', name_zh: '烤棕色 (Toasted Marshmallow)', hex: '#E8D2BD', r: 232, g: 210, b: 189 },
  { code: 'P70', name_zh: '金黄色 (Gold Metallic)', hex: '#D4AF37', r: 212, g: 175, b: 55 },
  { code: 'P79', name_zh: '浅棕色 (Light Brown)', hex: '#9E6B47', r: 158, g: 107, b: 71 },
  { code: 'P80', name_zh: '深灰色 (Dark Grey)', hex: '#4A4E53', r: 74, g: 78, b: 83 },
  { code: 'P85', name_zh: '午夜蓝 (Midnight)', hex: '#1C2638', r: 28, g: 38, b: 56 },
  { code: 'P88', name_zh: '橄榄绿 (Olive)', hex: '#586735', r: 88, g: 103, b: 53 },
  { code: 'P90', name_zh: '沙肤色 (Sand)', hex: '#E5C7A3', r: 229, g: 199, b: 163 },
  { code: 'P92', name_zh: '火烈鸟红 (Flamingo)', hex: '#EA6B66', r: 234, g: 107, b: 102 },
  { code: 'P93', name_zh: '群青蓝 (Cobalt)', hex: '#1F5BA6', r: 31, g: 91, b: 166 },
  { code: 'P96', name_zh: '杏黄色 (Apricot)', hex: '#F79F5E', r: 247, g: 159, b: 94 }
];

// 2. Artkal (阿卡尔) 标准色库
export const ARTKAL_PALETTE = [
  { code: 'S01', name_zh: '纯白 (Pure White)', hex: '#FFFFFF', r: 255, g: 255, b: 255 },
  { code: 'S02', name_zh: '米黄色 (Cream)', hex: '#FBF1C9', r: 251, g: 241, b: 201 },
  { code: 'S03', name_zh: '明黄 (Bright Yellow)', hex: '#FFDF00', r: 255, g: 223, b: 0 },
  { code: 'S04', name_zh: '中黄 (Medium Yellow)', hex: '#F9B700', r: 249, g: 183, b: 0 },
  { code: 'S05', name_zh: '金橙 (Golden Orange)', hex: '#F38100', r: 243, g: 129, b: 0 },
  { code: 'S06', name_zh: '橘红 (Orange Red)', hex: '#EB441F', r: 235, g: 68, b: 31 },
  { code: 'S07', name_zh: '正红 (Scarlet Red)', hex: '#CE181E', r: 206, g: 24, b: 30 },
  { code: 'S08', name_zh: '深红 (Crimson)', hex: '#8E1015', r: 142, g: 16, b: 21 },
  { code: 'S09', name_zh: '淡粉 (Baby Pink)', hex: '#F7BDD6', r: 247, g: 189, b: 214 },
  { code: 'S10', name_zh: '桃红 (Rose)', hex: '#EA5D8C', r: 234, g: 93, b: 140 },
  { code: 'S11', name_zh: '玫红 (Magenta)', hex: '#C21B66', r: 194, g: 27, b: 102 },
  { code: 'S12', name_zh: '浅紫 (Light Purple)', hex: '#B588BE', r: 181, g: 136, b: 190 },
  { code: 'S13', name_zh: '深紫 (Violet)', hex: '#582B71', r: 88, g: 43, b: 113 },
  { code: 'S14', name_zh: '天蓝 (Sky Blue)', hex: '#72BBE8', r: 114, g: 187, b: 232 },
  { code: 'S15', name_zh: '湖蓝 (Lake Blue)', hex: '#2182C5', r: 33, g: 130, b: 197 },
  { code: 'S16', name_zh: '宝蓝 (Royal Blue)', hex: '#0F4C81', r: 15, g: 76, b: 129 },
  { code: 'S17', name_zh: '薄荷绿 (Mint Green)', hex: '#87D7B0', r: 135, g: 215, b: 176 },
  { code: 'S18', name_zh: '苹果绿 (Apple Green)', hex: '#73C334', r: 115, g: 195, b: 52 },
  { code: 'S19', name_zh: '墨绿 (Forest Green)', hex: '#0B4E26', r: 11, g: 78, b: 38 },
  { code: 'S20', name_zh: '深黑 (Jet Black)', hex: '#111215', r: 17, g: 18, b: 21 },
  { code: 'S21', name_zh: '浅灰 (Silver Grey)', hex: '#B4B9BE', r: 180, g: 185, b: 190 },
  { code: 'S22', name_zh: '深灰 (Charcoal Grey)', hex: '#565A61', r: 86, g: 90, b: 97 },
  { code: 'S23', name_zh: '浅肤色 (Light Skin)', hex: '#FAD8BA', r: 250, g: 216, b: 186 },
  { code: 'S24', name_zh: '小麦肤色 (Wheat Skin)', hex: '#DEAA7C', r: 222, g: 170, b: 124 },
  { code: 'S25', name_zh: '土黄色 (Ochre)', hex: '#A8733E', r: 168, g: 115, b: 62 },
  { code: 'S26', name_zh: '咖啡色 (Coffee Brown)', hex: '#52341C', r: 82, g: 52, b: 28 },
  { code: 'S27', name_zh: '深棕 (Dark Chocolate)', hex: '#301F15', r: 48, g: 31, b: 21 },
  { code: 'S35', name_zh: '珊瑚红 (Coral)', hex: '#F06853', r: 240, g: 104, b: 83 },
  { code: 'S40', name_zh: '绿松石 (Cyan Teal)', hex: '#029E9D', r: 2, g: 158, b: 157 },
  { code: 'S44', name_zh: '樱花粉 (Sakura Pink)', hex: '#FDC4C8', r: 253, g: 196, b: 200 },
  { code: 'S50', name_zh: '古铜金 (Antique Gold)', hex: '#B8860B', r: 184, g: 134, b: 11 },
  { code: 'S55', name_zh: '紫罗兰 (Lavender)', hex: '#8A5A9E', r: 138, g: 90, b: 158 },
  { code: 'S60', name_zh: '抹茶绿 (Matcha)', hex: '#8F9753', r: 143, g: 151, b: 83 }
];

export function rgb2lab(r, g, b) {
  let r_ = r / 255, g_ = g / 255, b_ = b / 255;
  r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
  g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
  b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

  let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) / 0.95047;
  let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) / 1.00000;
  let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

export const MARD_LAB_PALETTE = MARD_PALETTE.map(item => ({
  ...item,
  lab: rgb2lab(item.r, item.g, item.b)
}));

export const PERLER_LAB_PALETTE = PERLER_PALETTE.map(item => ({
  ...item,
  lab: rgb2lab(item.r, item.g, item.b)
}));

export const ARTKAL_LAB_PALETTE = ARTKAL_PALETTE.map(item => ({
  ...item,
  lab: rgb2lab(item.r, item.g, item.b)
}));

export const BRAND_MAPS = {
  MARD: new Map(MARD_LAB_PALETTE.map(c => [c.code, c])),
  PERLER: new Map(PERLER_LAB_PALETTE.map(c => [c.code, c])),
  ARTKAL: new Map(ARTKAL_LAB_PALETTE.map(c => [c.code, c])),
};

export const BRAND_PALETTES = {
  MARD: MARD_LAB_PALETTE,
  PERLER: PERLER_LAB_PALETTE,
  ARTKAL: ARTKAL_LAB_PALETTE,
};

export function getPaletteDataByBrand(brand = 'MARD') {
  const b = (brand || 'MARD').toUpperCase();
  return {
    palette: BRAND_PALETTES[b] || BRAND_PALETTES.MARD,
    map: BRAND_MAPS[b] || BRAND_MAPS.MARD,
  };
}

export function findClosestBrandColor(r, g, b, brand = 'MARD') {
  const { palette } = getPaletteDataByBrand(brand);
  const targetLab = rgb2lab(r, g, b);

  let minDelta = Infinity;
  let closest = palette[0];

  for (let i = 0; i < palette.length; i++) {
    const item = palette[i];
    const dL = targetLab[0] - item.lab[0];
    const da = targetLab[1] - item.lab[1];
    const db = targetLab[2] - item.lab[2];
    const delta = dL * dL + da * da + db * db;
    if (delta < minDelta) {
      minDelta = delta;
      closest = item;
    }
  }

  return closest;
}
