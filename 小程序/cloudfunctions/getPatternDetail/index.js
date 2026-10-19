// # 获取单张图纸详情与评论流云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { patternId, id } = event;
  const targetId = patternId || id;

  if (!targetId) {
    return { success: false, message: '缺少图纸 ID' };
  }

  try {
    const res = await db.collection('patterns').doc(targetId).get();
    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};
