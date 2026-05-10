import { Client } from 'pg';

const DATABASE_URL = 'postgresql://user_56GxwQed:password_jYDX8Fdfd@duruofu.cn:5432/dy-2026';

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('数据库连接成功');

  // 建表
  await client.query(`
    CREATE TABLE IF NOT EXISTS clothes (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      category    VARCHAR(20) NOT NULL,
      color       VARCHAR(20),
      style       VARCHAR(20),
      season      VARCHAR(10),
      oss_url     TEXT,
      source      VARCHAR(20) DEFAULT 'upload',
      taobao_url  TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id          SERIAL PRIMARY KEY,
      scene       VARCHAR(50),
      items       JSONB NOT NULL,
      score       REAL,
      reason      TEXT,
      is_custom   BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS scenes (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(50) NOT NULL,
      icon        VARCHAR(10),
      description TEXT
    );
  `);
  console.log('三张表创建完成');

  // 清空旧数据 & 插入预置场景
  await client.query(`DELETE FROM scenes;`);
  await client.query(`
    INSERT INTO scenes (name, icon, description) VALUES
      ('通勤上班', '', '干练大方，适合办公室'),
      ('约会出行', '❤️', '精致有氛围感'),
      ('运动健身', '', '舒适透气，方便活动'),
      ('日常休闲', '☕', '随性自在'),
      ('朋友聚会', '', '时尚但不刻意');
  `);
  console.log('预置场景数据插入完成（5 条）');

  // 验证
  const { rows } = await client.query('SELECT * FROM scenes;');
  console.table(rows);

  await client.end();
  console.log('全部完成');
}

main().catch((e) => {
  console.error('失败:', e.message);
  process.exit(1);
});
