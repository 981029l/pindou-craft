// # 查询拼豆图纸列表 (支持我的作品库与公共社区广场)
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const type = event.type || 'my'; // # my | community
  const sortBy = event.sortBy || 'createTime'; // # createTime | likes

  try {
    let query = null;
    if (type === 'community') {
      // # 社区广场: 查询已公开至社区的所有图纸
      query = db.collection('patterns').where({
        isPublic: true
      });
    } else {
      // # 我的作品: 仅查询当前微信账号绑定的私密与公开图纸
      query = db.collection('patterns').where({
        _openid: openid
      });
    }

    const res = await query
      .orderBy(sortBy === 'likes' ? 'likes' : 'createTime', 'desc')
      .limit(60)
      .get();

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err.message
    };
  }
};
