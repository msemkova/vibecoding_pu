import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = process.env.DB_DIR ?? '/tmp/data'
const DB_PATH = path.join(DB_DIR, 'app.db')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password    TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`)

export type User = {
  id: number
  email: string
  password: string
  created_at: string
}

export const userRepo = {
  findByEmail(email: string): User | undefined {
    return db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase()) as User | undefined
  },

  create(email: string, hashedPassword: string): User {
    const stmt = db.prepare(
      'INSERT INTO users (email, password) VALUES (?, ?) RETURNING *'
    )
    return stmt.get(email.toLowerCase(), hashedPassword) as User
  },

  updatePassword(email: string, hashedPassword: string): void {
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(
      hashedPassword,
      email.toLowerCase()
    )
  },
}
