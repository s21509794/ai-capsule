const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'capsules.db');

// We wrap in a module-level singleton so the DB is only opened once
let _db = null;
let _SQL = null;

/**
 * Initialise and return the sql.js database instance.
 * Loads from file if it exists; creates fresh otherwise.
 * Writes back to file after every mutation (performed in routes via saveDb()).
 */
async function getDb() {
  if (_db) return _db;

  _SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new _SQL.Database(fileBuffer);
  } else {
    _db = new _SQL.Database();
  }

  // Create tables if not present
  _db.run(`
    CREATE TABLE IF NOT EXISTS capsules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      prompt_title TEXT NOT NULL,
      prompt_version TEXT,
      prompt_text TEXT NOT NULL,
      response_summary TEXT,
      category TEXT,
      usefulness TEXT,
      reviewed INTEGER DEFAULT 0,
      improved INTEGER DEFAULT 0,
      screenshot_url TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Save initial file
  saveDb(_db);

  return _db;
}

/**
 * Persist the in-memory sql.js database to disk.
 * Must be called after every INSERT / UPDATE / DELETE.
 */
function saveDb(db) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = { getDb, saveDb };
