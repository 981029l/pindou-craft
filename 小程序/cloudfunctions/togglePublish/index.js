// # 切换图纸公开/私密状态云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { patternId, isPublic } = event;

  if (!patternId) {
    return { success: false, message: '缺少图纸 ID' };
  }

  try {
    const res = await db.collection('patterns')
      .where({
        _id: patternId,
        _openid: openid
      })
      .update({
        data: {
          isPublic: !!isPublic,
          updateTime: db.serverDate()
        }
      });

    return {
      success: true,
      updated: res.stats.updated
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};
