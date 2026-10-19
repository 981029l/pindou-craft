// # 发表图纸评论云函数 (安全校验 + 原子入库)
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { patternId, content = '', authorName = '拼豆玩家', authorAvatar = '' } = event;

  if (!patternId || !content.trim()) {
    return { success: false, message: '评论内容不能为空' };
  }

  const commentObj = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    _openid: openid,
    authorName,
    authorAvatar,
    content: content.trim().slice(0, 300),
    createTime: Date.now()
  };

  try {
    // # 压入图纸评论数组
    await db.collection('patterns').doc(patternId).update({
      data: {
        comments: _.push(commentObj)
      }
    });

    return {
      success: true,
      data: commentObj,
      message: '评论发表成功'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};
