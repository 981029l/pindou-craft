// # 保存拼豆图纸云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const {
    name = '未命名作品',
    gridData = [],
    paletteBrand = 'MARD',
    width = 50,
    height = 50,
    previewUrl = '',
    authorName = '拼豆创作者',
    authorAvatar = ''
  } = event;

  if (!gridData || gridData.length === 0) {
    return { success: false, message: '图纸数据不能为空' };
  }

  try {
    const res = await db.collection('patterns').add({
      data: {
        _openid: openid,
        name,
        gridData,
        paletteBrand,
        width,
        height,
        previewUrl,
        authorName,
        authorAvatar,
        likes: 0,
        downloads: 0,
        isPublic: false,
        comments: [],
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });

    return {
      success: true,
      id: res._id,
      message: '图纸保存成功'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};
