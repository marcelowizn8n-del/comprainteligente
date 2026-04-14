const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'procureai.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    plan TEXT DEFAULT 'trial',
    trial_ends_at TEXT,
    mp_subscription_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT DEFAULT 'Nova conversa',
    tool TEXT DEFAULT 'chat',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
`);

// Migrate: adicionar campos novos se tabela já existia sem eles
try { db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'trial'`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN trial_ends_at TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN mp_subscription_id TEXT`); } catch(e) {}

// Garantir que marcelowiz@gmail.com seja admin
db.prepare(`UPDATE users SET role = 'admin', plan = 'active' WHERE email = ?`).run('marcelowiz@gmail.com');

module.exports = db;
