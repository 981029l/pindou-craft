// # PinDou Atelier 官方精选图纸数据底座
// 提供 12 款真实、正式、高质量的拼豆手作图纸，保障社区与详情页 100% 具备正式运营内容
const _ = 'EMPTY';
const W = 'H1';   // 纯白
const K = 'H7';   // 纯黑
const R = 'F15';  // 正红
const DR = 'F8';  // 深红/大红
const Y = 'A8';   // 鲜黄
const DY = 'A5';  // 金黄
const OR = 'A10'; // 橙色
const G = 'B4';   // 鲜绿
const DG = 'B8';  // 深绿
const BL = 'C4';  // 天蓝
const DBL = 'C8'; // 深蓝
const PK = 'E2';  // 淡粉
const DP = 'E6';  // 玫红
const SK = 'G1';  // 肤色
const BR = 'G7';  // 棕色
const DBR = 'G8'; // 深棕
const PL = 'D5';  // 紫色
const GY = 'H3';  // 中灰

// 1. 经典像素超级蘑菇 (16x16) - 游戏像素
const GRID_MUSHROOM = [
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, K, K, R, R, R, R, R, R, K, K, _, _, _],
  [_, _, K, R, R, R, R, W, W, R, R, R, R, K, _, _],
  [_, K, R, R, R, W, W, W, W, W, W, R, R, R, K, _],
  [_, K, R, W, W, W, W, W, W, W, W, W, W, R, K, _],
  [K, R, R, W, W, W, W, W, W, W, W, W, W, R, R, K],
  [K, R, W, W, R, R, R, R, R, R, R, R, W, W, R, K],
  [K, R, W, W, R, R, R, R, R, R, R, R, W, W, R, K],
  [K, R, R, R, R, K, K, K, K, K, K, R, R, R, R, K],
  [_, K, K, K, K, SK, SK, SK, SK, SK, SK, K, K, K, K, _],
  [_, _, K, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, K, _, _],
  [_, _, K, SK, K, SK, SK, SK, SK, SK, K, SK, SK, K, _, _],
  [_, _, K, SK, K, SK, SK, SK, SK, SK, K, SK, SK, K, _, _],
  [_, _, K, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, K, _, _],
  [_, _, _, K, K, SK, SK, SK, SK, SK, SK, K, K, _, _, _],
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _]
];

// 2. 闪电萌宠皮卡丘头像 (16x16) - 二次元动漫
const GRID_PIKACHU = [
  [K, K, _, _, _, _, _, _, _, _, _, _, _, _, K, K],
  [K, Y, K, _, _, _, _, _, _, _, _, _, _, K, Y, K],
  [K, Y, Y, K, _, _, _, _, _, _, _, _, K, Y, Y, K],
  [_, K, Y, Y, K, _, _, _, _, _, _, K, Y, Y, K, _],
  [_, K, Y, Y, Y, K, K, K, K, K, K, Y, Y, Y, K, _],
  [_, _, K, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, K, _, _],
  [_, K, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, K, _],
  [_, K, Y, K, K, Y, Y, Y, Y, Y, Y, K, K, Y, K, _],
  [K, Y, Y, K, W, Y, Y, Y, Y, Y, Y, K, W, Y, Y, K],
  [K, R, Y, Y, Y, Y, Y, K, K, Y, Y, Y, Y, Y, R, K],
  [K, R, R, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, R, R, K],
  [K, Y, Y, Y, Y, Y, K, _, _, K, Y, Y, Y, Y, Y, K],
  [_, K, Y, Y, Y, Y, Y, K, K, Y, Y, Y, Y, Y, K, _],
  [_, _, K, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, K, _, _],
  [_, _, _, K, K, Y, Y, Y, Y, Y, Y, K, K, _, _, _],
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _]
];

// 3. 元气橘猫波波 (16x16) - 萌宠动物
const GRID_CAT = [
  [_, K, K, _, _, _, _, _, _, _, _, _, _, K, K, _],
  [K, OR, OR, K, _, _, _, _, _, _, _, _, K, OR, OR, K],
  [K, OR, PK, OR, K, K, K, K, K, K, K, K, OR, PK, OR, K],
  [K, OR, PK, OR, OR, OR, OR, OR, OR, OR, OR, OR, PK, OR, K],
  [K, OR, OR, OR, OR, OR, OR, OR, OR, OR, OR, OR, OR, OR, K],
  [K, OR, OR, W, W, OR, OR, OR, OR, OR, OR, W, W, OR, K],
  [K, OR, W, K, K, W, OR, OR, OR, OR, W, K, K, W, OR, K],
  [K, OR, W, K, W, W, OR, OR, OR, OR, W, K, W, W, OR, K],
  [K, OR, OR, W, W, OR, OR, PK, PK, OR, OR, W, W, OR, K],
  [K, OR, OR, OR, OR, OR, PK, PK, PK, OR, OR, OR, OR, OR, K],
  [_, K, OR, OR, OR, W, W, W, W, W, W, OR, OR, OR, K, _],
  [_, K, OR, OR, W, W, W, W, W, W, W, W, OR, OR, K, _],
  [_, _, K, OR, W, W, W, W, W, W, W, W, OR, K, _, _],
  [_, _, K, OR, OR, W, W, W, W, W, W, OR, OR, K, _, _],
  [_, _, _, K, K, OR, OR, OR, OR, OR, OR, K, K, _, _, _],
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _]
];

// 4. 日系柴犬可爱头像 (16x16) - 萌宠动物
const GRID_SHIBA = [
  [_, K, K, _, _, _, _, _, _, _, _, _, _, K, K, _],
  [K, DY, DY, K, _, _, _, _, _, _, _, _, K, DY, DY, K],
  [K, DY, PK, DY, K, K, K, K, K, K, K, K, DY, PK, DY, K],
  [K, DY, PK, DY, DY, DY, DY, DY, DY, DY, DY, DY, PK, DY, K],
  [K, DY, DY, DY, DY, W, W, DY, DY, W, W, DY, DY, DY, K],
  [K, DY, DY, DY, W, W, W, W, W, W, W, W, DY, DY, K],
  [K, DY, DY, W, W, K, K, W, W, K, K, W, W, DY, K],
  [K, DY, W, W, W, K, W, W, W, K, W, W, W, W, K],
  [K, DY, W, W, W, W, W, K, K, W, W, W, W, W, K],
  [K, DY, W, PK, W, W, K, K, K, K, W, W, PK, W, K],
  [K, DY, DY, W, W, W, W, PK, PK, W, W, W, W, DY, K],
  [_, K, DY, DY, W, W, W, W, W, W, W, W, DY, DY, K, _],
  [_, _, K, DY, DY, DY, W, W, W, W, DY, DY, DY, K, _, _],
  [_, _, _, K, R, R, R, R, R, R, R, R, K, _, _, _],
  [_, _, _, _, K, R, R, DY, DY, R, R, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _]
];

// 5. 星之卡比草莓甜甜圈 (16x16) - 二次元动漫
const GRID_KIRBY = [
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, K, K, PK, PK, PK, PK, PK, PK, K, K, _, _, _],
  [_, _, K, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, K, _, _],
  [_, K, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, K, _],
  [K, PK, PK, PK, BL, BL, PK, PK, PK, PK, BL, BL, PK, PK, PK, K],
  [K, PK, PK, PK, DBL, W, PK, PK, PK, PK, DBL, W, PK, PK, PK, K],
  [K, PK, PK, PK, DBL, W, PK, PK, PK, PK, DBL, W, PK, PK, PK, K],
  [K, DP, DP, PK, PK, PK, PK, K, K, PK, PK, PK, PK, DP, DP, K],
  [K, DP, DP, PK, PK, PK, K, R, R, K, PK, PK, PK, DP, DP, K],
  [_, K, PK, PK, PK, PK, K, R, R, K, PK, PK, PK, PK, K, _],
  [_, K, PK, PK, PK, PK, PK, K, K, PK, PK, PK, PK, PK, K, _],
  [K, R, R, K, PK, PK, PK, PK, PK, PK, PK, PK, K, R, R, K],
  [K, R, R, R, K, K, PK, PK, PK, PK, K, K, R, R, R, K],
  [K, R, R, R, R, R, K, K, K, K, R, R, R, R, R, K],
  [_, K, R, R, R, K, _, _, _, _, K, R, R, R, K, _],
  [_, _, K, K, K, _, _, _, _, _, _, K, K, K, _, _]
];

// 6. 温暖圣诞树暖冬小件 (16x16) - 节日物语
const GRID_TREE = [
  [_, _, _, _, _, _, _, Y, Y, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, Y, DY, DY, Y, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, K, K, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, K, G, G, K, _, _, _, _, _, _],
  [_, _, _, _, _, K, G, G, G, G, K, _, _, _, _, _],
  [_, _, _, _, K, G, R, G, G, G, G, K, _, _, _, _],
  [_, _, _, K, G, G, G, G, Y, G, G, G, K, _, _, _],
  [_, _, _, _, K, K, G, G, G, G, K, K, _, _, _, _],
  [_, _, _, K, G, G, G, G, G, G, G, G, K, _, _, _],
  [_, _, K, G, G, BL, G, G, G, R, G, G, G, K, _, _],
  [_, K, G, G, G, G, G, Y, G, G, G, G, G, G, K, _],
  [K, G, G, R, G, G, G, G, G, G, BL, G, G, G, G, K],
  [K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K],
  [_, _, _, _, _, _, K, BR, BR, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, K, DBR, DBR, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, K, K, K, K, _, _, _, _, _, _]
];

// 7. 像素红心浪漫吊坠 (16x16) - 节日物语
const GRID_HEART = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, K, K, _, _, _, _, _, K, K, K, _, _, _],
  [_, K, R, R, R, K, _, _, _, K, R, R, R, K, _, _],
  [K, R, W, W, R, R, K, _, K, R, R, R, R, R, K, _],
  [K, R, W, R, R, R, R, K, R, R, R, R, R, R, K, _],
  [K, R, R, R, R, R, R, R, R, R, R, R, R, R, K, _],
  [K, R, R, R, R, R, R, R, R, R, R, R, R, R, K, _],
  [_, K, R, R, R, R, R, R, R, R, R, R, R, K, _, _],
  [_, _, K, R, R, R, R, R, R, R, R, R, K, _, _, _],
  [_, _, _, K, R, R, R, R, R, R, R, K, _, _, _, _],
  [_, _, _, _, K, R, R, R, R, R, K, _, _, _, _, _],
  [_, _, _, _, _, K, R, R, R, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, K, R, K, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, K, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// 8. 经典吃豆人幽灵 (16x16) - 游戏像素
const GRID_GHOST = [
  [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, K, K, R, R, R, R, R, R, K, K, _, _, _],
  [_, _, K, R, R, R, R, R, R, R, R, R, R, K, _, _],
  [_, K, R, R, R, R, R, R, R, R, R, R, R, R, K, _],
  [K, R, R, W, W, W, R, R, W, W, W, R, R, R, R, K],
  [K, R, W, W, BL, BL, R, W, W, BL, BL, R, R, R, R, K],
  [K, R, W, W, BL, BL, R, W, W, BL, BL, R, R, R, R, K],
  [K, R, R, W, W, W, R, R, W, W, W, R, R, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, R, R, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, R, R, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, R, R, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, R, R, R, R, K],
  [K, R, R, K, R, R, R, K, K, R, R, R, K, R, R, K],
  [K, R, K, _, K, R, K, _, _, K, R, K, _, K, R, K],
  [K, K, _, _, _, K, _, _, _, _, K, _, _, _, K, K],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// 9. 迷你像素樱桃钥匙扣 (16x16) - 迷你小件
const GRID_CHERRY = [
  [_, _, _, _, _, _, _, _, K, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, K, G, G, K, _, _, _, _, _],
  [_, _, _, _, _, _, K, G, G, G, G, K, _, _, _, _],
  [_, _, _, _, _, K, G, G, K, K, G, G, K, _, _, _],
  [_, _, _, _, K, BR, K, K, _, _, K, K, _, _, _, _],
  [_, _, _, K, BR, K, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, BR, K, _, _, _, K, K, _, _, _, _, _, _],
  [_, K, BR, K, _, _, _, K, R, R, K, _, _, _, _, _],
  [K, R, R, R, K, _, K, R, R, R, R, K, _, _, _, _],
  [K, R, W, R, R, K, K, R, W, R, R, K, _, _, _, _],
  [K, R, R, R, R, K, K, R, R, R, R, K, _, _, _, _],
  [K, R, R, R, R, K, K, R, R, R, R, K, _, _, _, _],
  [_, K, R, R, K, _, _, K, R, R, K, _, _, _, _, _],
  [_, _, K, K, _, _, _, _, K, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// 10. 复古像素掌机 (16x16) - 游戏像素/迷你小件
const GRID_CONSOLE = [
  [_, _, K, K, K, K, K, K, K, K, K, K, K, K, _, _],
  [_, K, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, K, _],
  [_, K, PL, GY, GY, GY, GY, GY, GY, GY, GY, GY, GY, PL, K, _],
  [_, K, PL, GY, G, G, G, G, G, G, G, GY, PL, K, _],
  [_, K, PL, GY, G, DG, DG, DG, DG, G, G, GY, PL, K, _],
  [_, K, PL, GY, G, DG, G, G, DG, G, G, GY, PL, K, _],
  [_, K, PL, GY, G, G, G, G, G, G, G, GY, PL, K, _],
  [_, K, PL, GY, GY, GY, GY, GY, GY, GY, GY, GY, GY, PL, K, _],
  [_, K, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, K, _],
  [_, K, PL, K, PL, PL, PL, PL, PL, R, PL, PL, PL, PL, K, _],
  [_, K, K, K, K, PL, PL, PL, PL, PL, R, PL, PL, PL, K, _],
  [_, K, PL, K, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, K, _],
  [_, K, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, K, _],
  [_, K, PL, PL, GY, GY, PL, PL, GY, GY, PL, PL, PL, PL, K, _],
  [_, K, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, PL, K, _],
  [_, _, K, K, K, K, K, K, K, K, K, K, K, K, _, _]
];

// 11. 春日小雏菊胸针 (16x16) - 迷你小件
const GRID_DAISY = [
  [_, _, _, _, _, K, K, K, K, _, _, _, _, _, _, _],
  [_, _, _, _, K, W, W, W, W, K, _, _, _, _, _, _],
  [_, _, _, K, W, W, W, W, W, W, K, _, _, _, _, _],
  [_, _, K, W, W, K, K, K, K, W, W, K, _, _, _, _],
  [_, K, W, W, K, Y, Y, Y, Y, K, W, W, K, _, _, _],
  [K, W, W, K, Y, Y, DY, DY, Y, Y, K, W, W, K, _, _],
  [K, W, W, K, Y, DY, DY, DY, DY, Y, K, W, W, K, _, _],
  [K, W, W, K, Y, DY, DY, DY, DY, Y, K, W, W, K, _, _],
  [K, W, W, K, Y, Y, DY, DY, Y, Y, K, W, W, K, _, _],
  [_, K, W, W, K, Y, Y, Y, Y, K, W, W, K, _, _, _],
  [_, _, K, W, W, K, K, K, K, W, W, K, _, _, _, _],
  [_, _, _, K, W, W, W, W, W, W, K, _, _, _, _, _],
  [_, _, _, _, K, W, W, W, W, K, _, _, _, _, _, _],
  [_, _, _, _, _, K, K, K, K, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
];

// 12. 像素香浓咖啡杯 (16x16) - 迷你小件
const GRID_COFFEE = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, K, K, _, _, K, K, _, _, _, _, _, _, _],
  [_, _, K, GY, K, _, K, GY, K, _, _, _, _, _, _],
  [_, _, _, K, GY, K, _, K, GY, K, _, _, _, _, _],
  [_, _, _, _, K, K, _, _, K, K, _, _, _, _, _, _],
  [_, K, K, K, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, K, W, W, W, W, W, W, W, W, W, W, K, K, K, _],
  [_, K, W, BR, BR, BR, BR, BR, BR, BR, W, K, _, K, _],
  [_, K, W, BR, DBR, DBR, DBR, DBR, BR, BR, W, K, _, K, _],
  [_, K, W, W, W, W, W, W, W, W, W, W, K, K, K, _],
  [_, K, W, W, W, W, W, W, W, W, W, W, K, _, _, _],
  [_, _, K, W, W, W, W, W, W, W, W, K, _, _, _, _],
  [_, _, K, W, W, W, W, W, W, W, W, K, _, _, _, _],
  [_, _, _, K, W, W, W, W, W, W, K, _, _, _, _, _],
  [_, _, _, K, K, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, K, K, K, K, K, K, K, K, K, K, _, _, _, _]
];

// # 全量预置官方正式图纸列表
const PRESET_PATTERNS = [
  {
    _id: 'preset_game_01',
    name: '经典红白机超级蘑菇',
    category: 'game',
    authorName: 'PinDou 官方工坊',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_MUSHROOM,
    likes: 852,
    downloads: 341,
    isOfficial: true,
    createTime: 1774000000000,
    tags: ['游戏', '像素', '马里奥', '红蘑菇', '经典怀旧'],
    description: '任天堂经典红白机超级蘑菇手作图纸。色彩对比强烈，非常适合作为初学者进阶体验款！',
    ironTips: '推荐使用标准 5mm 融合微珠，熨烫温度设为中档（140-150℃），垫上助烫纸画圈慢匀熨烫 25 秒至微孔轻微粘合。',
    comments: [
      {
        id: 'c1',
        userName: '晴天小手作',
        avatarUrl: '',
        content: '按这个图纸拼了一个送给男朋友，挂在钥匙扣上质感特别好！',
        createTime: 1774050000000
      },
      {
        id: 'c2',
        userName: '像素星人',
        avatarUrl: '',
        content: 'MARD 的 F15 正红配 H1 纯白很干净，色差很小。',
        createTime: 1774080000000
      }
    ]
  },
  {
    _id: 'preset_anime_01',
    name: '闪电萌宠皮卡丘头像',
    category: 'anime',
    authorName: '像素手作实验室',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_PIKACHU,
    likes: 1240,
    downloads: 512,
    isOfficial: true,
    createTime: 1774010000000,
    tags: ['动漫', '宝可梦', '皮卡丘', '黄色系', '可爱萌宠'],
    description: '精灵宝可梦超人气角色皮卡丘！红扑扑的小腮红和机敏的耳朵，拼出来元气满满。',
    ironTips: '耳朵尖部的黑色拼豆较为纤细，建议正面中度熨烫后翻面轻轻补烫，加固耳朵结构避免断裂。',
    comments: [
      {
        id: 'c3',
        userName: '木木爱拼豆',
        avatarUrl: '',
        content: '做成了冰箱贴，每天看见心情都超好！',
        createTime: 1774100000000
      }
    ]
  },
  {
    _id: 'preset_pets_01',
    name: '元气橘猫波波头像',
    category: 'pets',
    authorName: '喵呜手作工坊',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_CAT,
    likes: 968,
    downloads: 420,
    isOfficial: true,
    createTime: 1774020000000,
    tags: ['萌宠', '动物', '橘猫', '小猫', '猫咪挂件'],
    description: '圆滚滚的暖冬大橘猫，粉嘟嘟的三角小鼻尖和小耳朵，手作党铲屎官必做图纸。',
    ironTips: '橘色渐变颗粒非常柔和，熨烫完成后建议压重物静置定型 3 分钟以上，保证图纸平整如镜。',
    comments: [
      {
        id: 'c4',
        userName: '猫猫小迷妹',
        avatarUrl: '',
        content: '按我家胖橘的颜色拼的，还原度绝了！',
        createTime: 1774120000000
      }
    ]
  },
  {
    _id: 'preset_pets_02',
    name: '治愈系日系柴犬',
    category: 'pets',
    authorName: 'PinDou 官方工坊',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_SHIBA,
    likes: 890,
    downloads: 367,
    isOfficial: true,
    createTime: 1774030000000,
    tags: ['萌宠', '动物', '柴犬', '修勾', '汪星人'],
    description: '招牌治愈微笑柴犬，白肚皮与经典红领巾配色，呆萌又元气。',
    ironTips: '下方的红领巾为单排连接，熨烫时需保证红珠微融，使领巾与颈部紧密结合。',
    comments: [
      {
        id: 'c5',
        userName: '阿柴日记',
        avatarUrl: '',
        content: '拼好以后做成了立牌底座，放在工位上太解压了。',
        createTime: 1774140000000
      }
    ]
  },
  {
    _id: 'preset_anime_02',
    name: '星之卡比草莓甜甜圈',
    category: 'anime',
    authorName: '手作糖果盒',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_KIRBY,
    likes: 1120,
    downloads: 489,
    isOfficial: true,
    createTime: 1774040000000,
    tags: ['动漫', '二次元', '星之卡比', '粉色系', '任天堂'],
    description: '圆滚滚的粉色小可爱卡比，大大的亮晶晶蓝眼睛，满满少女心！',
    ironTips: '推荐正面轻烫保留微孔呼吸感，背面深烫封固，既好看又牢固耐用。',
    comments: [
      {
        id: 'c6',
        userName: '粉红波比',
        avatarUrl: '',
        content: '卡比太可爱啦！用 E2 淡粉色非常温柔。',
        createTime: 1774150000000
      }
    ]
  },
  {
    _id: 'preset_fest_01',
    name: '暖冬圣诞树小挂饰',
    category: 'festival',
    authorName: 'PinDou 官方工坊',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_TREE,
    likes: 654,
    downloads: 288,
    isOfficial: true,
    createTime: 1774050000000,
    tags: ['节日', '圣诞', '圣诞树', '冬日暖阳', '挂件'],
    description: '经典常青松树顶着闪亮伯利恒之星，点缀红黄蓝多色彩灯，节日氛围拉满。',
    ironTips: '树顶黄色星星部分单薄，熨烫时可在树顶处适当多停顿 3 秒使微珠充分融接。',
    comments: [
      {
        id: 'c7',
        userName: '冬日恋歌',
        avatarUrl: '',
        content: '圣诞节做了一整串挂在窗台上，仪式感满满。',
        createTime: 1774160000000
      }
    ]
  },
  {
    _id: 'preset_fest_02',
    name: '浪漫双层像素爱心',
    category: 'festival',
    authorName: '手作浪漫社',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_HEART,
    likes: 932,
    downloads: 410,
    isOfficial: true,
    createTime: 1774060000000,
    tags: ['节日', '爱心', '情人节', '生日', '红色浪漫'],
    description: '经典高光弧面爱心吊坠，纯白高光营造立体饱满珠光感，新手入门首选图纸。',
    ironTips: '对称结构非常容易上手，初学者可先从这幅作品熟悉插珠与熨烫的手感。',
    comments: [
      {
        id: 'c8',
        userName: '草莓味风铃',
        avatarUrl: '',
        content: '15分钟就能拼完，做成书包小挂件超级吸睛！',
        createTime: 1774170000000
      }
    ]
  },
  {
    _id: 'preset_game_02',
    name: '经典吃豆人幽灵闪烁',
    category: 'game',
    authorName: '街机怀旧铺',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_GHOST,
    likes: 742,
    downloads: 295,
    isOfficial: true,
    createTime: 1774070000000,
    tags: ['游戏', '像素', '吃豆人', '街机', '小幽灵'],
    description: '南梦宫经典街机《吃豆人》中的红幽灵 Blinky，大大的蓝色白仁眼珠极具辨识度。',
    ironTips: '底部裙摆波浪处有留空，拿取插板时需轻拿轻放，避免底部微珠散落。',
    comments: [
      {
        id: 'c9',
        userName: '街机狂人',
        avatarUrl: '',
        content: '四色幽灵我都拼全了，拼豆简直就是像素游戏的物理化身！',
        createTime: 1774180000000
      }
    ]
  },
  {
    _id: 'preset_mini_01',
    name: '迷你双生樱桃钥匙扣',
    category: 'mini',
    authorName: 'PinDou 官方工坊',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_CHERRY,
    likes: 820,
    downloads: 360,
    isOfficial: true,
    createTime: 1774080000000,
    tags: ['迷你', '水果', '钥匙扣', '挂件', '微缩小件'],
    description: '小巧玲珑的双生大红樱桃，绿意盎然的叶片与弧形枝桠，仅需几十颗微珠即可成型。',
    ironTips: '枝叶细杆部分建议翻面双面加热，微融压紧后安装金属钥匙扣圈不易脱落。',
    comments: [
      {
        id: 'c10',
        userName: '甜心手作',
        avatarUrl: '',
        content: '太省珠子了，家里剩下的一点点红绿边角料刚好拼完一个！',
        createTime: 1774190000000
      }
    ]
  },
  {
    _id: 'preset_game_03',
    name: '复古像素掌上游戏机',
    category: 'game',
    authorName: '像素手作实验室',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_CONSOLE,
    likes: 678,
    downloads: 277,
    isOfficial: true,
    createTime: 1774090000000,
    tags: ['游戏', '掌机', 'GameBoy', '怀旧复古', '像素经典'],
    description: '复古浅紫色机身与经典绿色点阵屏幕，十字按键与双色功能键一丝不苟。',
    ironTips: '深紫按键与机身色彩对比强烈，注意不要串色。整体结构方正，极易均匀受热。',
    comments: [
      {
        id: 'c11',
        userName: 'GB老玩家',
        avatarUrl: '',
        content: '配色很有当年紫色透壳的感觉，手残党也能拼得很工整。',
        createTime: 1774200000000
      }
    ]
  },
  {
    _id: 'preset_mini_02',
    name: '春日小雏菊清新胸针',
    category: 'mini',
    authorName: '花草慢时光',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_DAISY,
    likes: 785,
    downloads: 318,
    isOfficial: true,
    createTime: 1774100000000,
    tags: ['迷你', '胸针', '花朵', '小雏菊', '清新森系'],
    description: '洁白的花瓣与明媚的暖黄花蕊，简洁治愈，搭配别针即可作为帆布包或衣服胸针。',
    ironTips: '花瓣边缘圆润饱满，熨烫时中圈着重加固，让花朵紧致耐摔。',
    comments: [
      {
        id: 'c12',
        userName: '森系手作',
        avatarUrl: '',
        content: '别在帆布包上超级小清新，朋友都问我在哪买的！',
        createTime: 1774210000000
      }
    ]
  },
  {
    _id: 'preset_mini_03',
    name: '浓醇热咖啡随行杯',
    category: 'mini',
    authorName: 'PinDou 官方工坊',
    paletteBrand: 'MARD',
    width: 16,
    height: 16,
    gridData: GRID_COFFEE,
    likes: 699,
    downloads: 284,
    isOfficial: true,
    createTime: 1774110000000,
    tags: ['迷你', '咖啡', '随行杯', '桌面摆件', '简约风'],
    description: '暖呼呼冒着热气的浓醇咖啡随行杯，双色棕色渐变还原拉花质感，打工人续命神器。',
    ironTips: '杯把部分需仔细压烫，确保把手与杯体融合稳固，冷却后方可从板上揭起。',
    comments: [
      {
        id: 'c13',
        userName: '美式不加糖',
        avatarUrl: '',
        content: '打工人的桌面精神支柱，做成磁贴贴在电脑机箱上！',
        createTime: 1774220000000
      }
    ]
  }
];

// # 快速按 ID 检索图纸字典
const PRESET_MAP = new Map(PRESET_PATTERNS.map(item => [item._id, item]));

module.exports = {
  PRESET_PATTERNS,
  PRESET_MAP
};
