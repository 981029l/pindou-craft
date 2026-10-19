// # 删除指定拼豆图纸云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const targetId = event.patternId || event.id || event._id;

  if (!targetId) {
    return { success: false, message: '缺少图纸 ID' };
  }

  try {
    // # 精准物理删除指定图纸
    await db.collection('patterns').doc(targetId).remove();

    return {
      success: true,
      message: '图纸已成功删除'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};
