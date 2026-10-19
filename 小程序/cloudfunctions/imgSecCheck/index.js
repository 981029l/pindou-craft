// # 微信官方内容安全过滤云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { fileID } = event;

  try {
    const res = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: Buffer.from('')
      }
    });
    return { success: true, res };
  } catch (err) {
    return { success: false, error: err };
  }
};
