import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'projectflow.db');
const db = new Database(dbPath);

// Initialize database schema
const initDb = () => {
  // Projects table (stores both ideas and completed projects)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      requirements TEXT, -- JSON array
      logo TEXT,
      links TEXT, -- JSON array
      notes TEXT, -- JSON array
      progress INTEGER,
      tags TEXT, -- JSON array
      repoUrl TEXT,
      apiKeys TEXT, -- JSON array
      apiKeyPin TEXT,
      dueDate TEXT,
      status TEXT DEFAULT 'idea' -- 'idea' or 'completed'
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      completed INTEGER DEFAULT 0, -- boolean stored as 0/1
      links TEXT, -- JSON array
      logo TEXT,
      notes TEXT, -- JSON array
      reason TEXT
    )
  `);

  // Links table (global links)
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT
    )
  `);
  
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
};

initDb();

export default db;
