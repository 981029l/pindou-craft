// # 数据持久化存储引擎 (优先 SQLite，无缝自适应 JSON 文件备份)
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbMode = 'json'; // 'sqlite' | 'json'
let sqliteDb = null;

// # 尝试加载 better-sqlite3
try {
  const Database = require('better-sqlite3');
  const dbPath = path.join(DATA_DIR, 'pindou.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  dbMode = 'sqlite';
  console.log('[Database] 正在使用 SQLite 引擎:', dbPath);

  // # 初始化数据表
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      openid TEXT PRIMARY KEY,
      nickname TEXT,
      avatar TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS patterns (
      id TEXT PRIMARY KEY,
      openid TEXT,
      name TEXT,
      grid_data TEXT,
      palette_brand TEXT,
      width INTEGER,
      height INTEGER,
      preview_url TEXT,
      author_name TEXT,
      author_avatar TEXT,
      likes INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      comments TEXT DEFAULT '[]',
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_patterns_openid ON patterns(openid);
    CREATE INDEX IF NOT EXISTS idx_patterns_public ON patterns(is_public);
    CREATE INDEX IF NOT EXISTS idx_patterns_created ON patterns(created_at);
  `);
} catch (e) {
  dbMode = 'json';
  console.log('[Database] 未检测到 SQLite 原生依赖，平滑启用文件型 JSON 引擎:', path.join(DATA_DIR, 'pindou.json'));
}

// # JSON 文件降级引擎
const JSON_FILE = path.join(DATA_DIR, 'pindou.json');
function loadJsonStore() {
  if (!fs.existsSync(JSON_FILE)) {
    const initData = { users: {}, patterns: {} };
    fs.writeFileSync(JSON_FILE, JSON.stringify(initData, null, 2), 'utf-8');
    return initData;
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  } catch (err) {
    return { users: {}, patterns: {} };
  }
}

function saveJsonStore(data) {
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// # 统一对外接口
const dbService = {
  // # 1. 用户操作
  saveUser({ openid, nickname = '拼豆创作者', avatar = '' }) {
    const now = Date.now();
    if (dbMode === 'sqlite') {
      const stmt = sqliteDb.prepare(`
        INSERT INTO users (openid, nickname, avatar, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(openid) DO UPDATE SET
          nickname = excluded.nickname,
          avatar = excluded.avatar
      `);
      stmt.run(openid, nickname, avatar, now);
      return { openid, nickname, avatar };
    } else {
      const store = loadJsonStore();
      store.users[openid] = {
        openid,
        nickname,
        avatar,
        created_at: store.users[openid]?.created_at || now
      };
      saveJsonStore(store);
      return store.users[openid];
    }
  },

  getUser(openid) {
    if (dbMode === 'sqlite') {
      return sqliteDb.prepare('SELECT * FROM users WHERE openid = ?').get(openid) || null;
    } else {
      const store = loadJsonStore();
      return store.users[openid] || null;
    }
  },

  // # 2. 图纸保存
  savePattern(data) {
    const id = `pat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    const pattern = {
      id,
      openid: data.openid,
      name: data.name || '未命名作品',
      gridData: data.gridData || [],
      paletteBrand: data.paletteBrand || 'MARD',
      width: data.width || 50,
      height: data.height || 50,
      previewUrl: data.previewUrl || '',
      authorName: data.authorName || '拼豆创作者',
      authorAvatar: data.authorAvatar || '',
      likes: 0,
      downloads: 0,
      isPublic: data.isPublic ? 1 : 0,
      comments: [],
      createTime: now,
      updateTime: now
    };

    if (dbMode === 'sqlite') {
      const stmt = sqliteDb.prepare(`
        INSERT INTO patterns (
          id, openid, name, grid_data, palette_brand, width, height,
          preview_url, author_name, author_avatar, likes, downloads,
          is_public, comments, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        pattern.id,
        pattern.openid,
        pattern.name,
        JSON.stringify(pattern.gridData),
        pattern.paletteBrand,
        pattern.width,
        pattern.height,
        pattern.previewUrl,
        pattern.authorName,
        pattern.authorAvatar,
        pattern.likes,
        pattern.downloads,
        pattern.isPublic,
        JSON.stringify(pattern.comments),
        pattern.createTime,
        pattern.updateTime
      );
    } else {
      const store = loadJsonStore();
      store.patterns[id] = pattern;
      saveJsonStore(store);
    }

    return pattern;
  },

  // # 3. 图纸列表查询 (我的 / 社区广场)
  getPatternList({ type = 'my', openid = '', sortBy = 'createTime', limit = 60 }) {
    if (dbMode === 'sqlite') {
      let query = '';
      let params = [];
      const orderCol = sortBy === 'likes' ? 'likes' : 'created_at';

      if (type === 'community') {
        query = `SELECT * FROM patterns WHERE is_public = 1 ORDER BY ${orderCol} DESC LIMIT ?`;
        params = [limit];
      } else {
        query = `SELECT * FROM patterns WHERE openid = ? ORDER BY ${orderCol} DESC LIMIT ?`;
        params = [openid, limit];
      }

      const rows = sqliteDb.prepare(query).all(...params);
      return rows.map(r => ({
        _id: r.id,
        _openid: r.openid,
        name: r.name,
        gridData: JSON.parse(r.grid_data || '[]'),
        paletteBrand: r.palette_brand,
        width: r.width,
        height: r.height,
        previewUrl: r.preview_url,
        authorName: r.author_name,
        authorAvatar: r.author_avatar,
        likes: r.likes,
        downloads: r.downloads,
        isPublic: !!r.is_public,
        comments: JSON.parse(r.comments || '[]'),
        createTime: r.created_at,
        updateTime: r.updated_at
      }));
    } else {
      const store = loadJsonStore();
      let list = Object.values(store.patterns);
      if (type === 'community') {
        list = list.filter(p => p.isPublic);
      } else {
        list = list.filter(p => p.openid === openid);
      }
      list.sort((a, b) => {
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        return (b.createTime || 0) - (a.createTime || 0);
      });
      return list.slice(0, limit).map(p => ({
        _id: p.id,
        _openid: p.openid,
        ...p,
        isPublic: !!p.isPublic
      }));
    }
  },

  // # 4. 图纸详情
  getPatternDetail(id) {
    if (dbMode === 'sqlite') {
      const r = sqliteDb.prepare('SELECT * FROM patterns WHERE id = ?').get(id);
      if (!r) return null;
      return {
        _id: r.id,
        _openid: r.openid,
        name: r.name,
        gridData: JSON.parse(r.grid_data || '[]'),
        paletteBrand: r.palette_brand,
        width: r.width,
        height: r.height,
        previewUrl: r.preview_url,
        authorName: r.author_name,
        authorAvatar: r.author_avatar,
        likes: r.likes,
        downloads: r.downloads,
        isPublic: !!r.is_public,
        comments: JSON.parse(r.comments || '[]'),
        createTime: r.created_at,
        updateTime: r.updated_at
      };
    } else {
      const store = loadJsonStore();
      const p = store.patterns[id];
      if (!p) return null;
      return {
        _id: p.id,
        _openid: p.openid,
        ...p,
        isPublic: !!p.isPublic
      };
    }
  },

  // # 5. 删除图纸
  deletePattern(id, openid) {
    if (dbMode === 'sqlite') {
      let stmt;
      if (openid) {
        stmt = sqliteDb.prepare('DELETE FROM patterns WHERE id = ? AND openid = ?');
        const res = stmt.run(id, openid);
        return res.changes > 0;
      } else {
        stmt = sqliteDb.prepare('DELETE FROM patterns WHERE id = ?');
        const res = stmt.run(id);
        return res.changes > 0;
      }
    } else {
      const store = loadJsonStore();
      const p = store.patterns[id];
      if (!p) return false;
      if (openid && p.openid !== openid) return false;
      delete store.patterns[id];
      saveJsonStore(store);
      return true;
    }
  },

  // # 6. 切换公开 / 私密
  togglePublish(id, isPublic, openid) {
    const val = isPublic ? 1 : 0;
    const now = Date.now();
    if (dbMode === 'sqlite') {
      let stmt;
      if (openid) {
        stmt = sqliteDb.prepare('UPDATE patterns SET is_public = ?, updated_at = ? WHERE id = ? AND openid = ?');
        const res = stmt.run(val, now, id, openid);
        return res.changes > 0;
      } else {
        stmt = sqliteDb.prepare('UPDATE patterns SET is_public = ?, updated_at = ? WHERE id = ?');
        const res = stmt.run(val, now, id);
        return res.changes > 0;
      }
    } else {
      const store = loadJsonStore();
      const p = store.patterns[id];
      if (!p) return false;
      if (openid && p.openid !== openid) return false;
      p.isPublic = !!isPublic;
      p.updateTime = now;
      saveJsonStore(store);
      return true;
    }
  },

  // # 7. 点赞自增
  likePattern(id) {
    if (dbMode === 'sqlite') {
      const stmt = sqliteDb.prepare('UPDATE patterns SET likes = likes + 1 WHERE id = ?');
      const res = stmt.run(id);
      if (res.changes > 0) {
        const row = sqliteDb.prepare('SELECT likes FROM patterns WHERE id = ?').get(id);
        return row ? row.likes : 1;
      }
      return 0;
    } else {
      const store = loadJsonStore();
      const p = store.patterns[id];
      if (!p) return 0;
      p.likes = (p.likes || 0) + 1;
      saveJsonStore(store);
      return p.likes;
    }
  },

  // # 8. 开拼下载自增
  recordDownload(id) {
    if (dbMode === 'sqlite') {
      const stmt = sqliteDb.prepare('UPDATE patterns SET downloads = downloads + 1 WHERE id = ?');
      stmt.run(id);
      return true;
    } else {
      const store = loadJsonStore();
      const p = store.patterns[id];
      if (!p) return false;
      p.downloads = (p.downloads || 0) + 1;
      saveJsonStore(store);
      return true;
    }
  },

  // # 9. 发表评论
  addComment(patternId, { openid = '', authorName = '拼豆玩家', authorAvatar = '', content = '' }) {
    const commentObj = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      _openid: openid,
      authorName,
      authorAvatar,
      content: content.trim().slice(0, 300),
      createTime: Date.now()
    };

    if (dbMode === 'sqlite') {
      const r = sqliteDb.prepare('SELECT comments FROM patterns WHERE id = ?').get(patternId);
      if (!r) return null;
      const list = JSON.parse(r.comments || '[]');
      list.push(commentObj);
      sqliteDb.prepare('UPDATE patterns SET comments = ? WHERE id = ?').run(JSON.stringify(list), patternId);
      return commentObj;
    } else {
      const store = loadJsonStore();
      const p = store.patterns[patternId];
      if (!p) return null;
      if (!Array.isArray(p.comments)) p.comments = [];
      p.comments.push(commentObj);
      saveJsonStore(store);
      return commentObj;
    }
  }
};

module.exports = dbService;
