import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'database.sqlite');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS beian_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      domain TEXT,
      description TEXT,
      owner_name TEXT,
      owner_dept TEXT,
      owner_contact TEXT,
      status TEXT DEFAULT '未备案',
      beian_no TEXT,
      beian_date TEXT,
      server_info TEXT,
      db_type TEXT,
      tech_stack TEXT,
      security_level TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_beian_status ON beian_records(status);
    CREATE INDEX IF NOT EXISTS idx_beian_name ON beian_records(name);

    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beian_id INTEGER NOT NULL,
      ip_address TEXT NOT NULL,
      os TEXT,
      middleware TEXT,
      db_type TEXT,
      cpu_memory TEXT,
      disk TEXT,
      location TEXT,
      purpose TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beian_id) REFERENCES beian_records(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_server_ip ON servers(ip_address);
    CREATE INDEX IF NOT EXISTS idx_server_beian ON servers(beian_id);
  `);

  // 迁移：添加 vendor / tech_contact / tech_phone 列（已存在则跳过）
  try { db.exec(`ALTER TABLE beian_records ADD COLUMN vendor TEXT`); } catch {}
  try { db.exec(`ALTER TABLE beian_records ADD COLUMN tech_contact TEXT`); } catch {}
  try { db.exec(`ALTER TABLE beian_records ADD COLUMN tech_phone TEXT`); } catch {}

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
  if (adminCount.count === 0) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  }
}
