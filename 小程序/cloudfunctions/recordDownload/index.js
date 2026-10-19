// # 记录图纸开拼下载量原子自增云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { patternId } = event;

  if (!patternId) {
    return { success: false, message: '缺少图纸 ID' };
  }

  try {
    await db.collection('patterns').doc(patternId).update({
      data: {
        downloads: _.inc(1)
      }
    });

    return {
      success: true,
      message: '开拼下载计数自增成功'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};
