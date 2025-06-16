import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Create SQLite database connection
const sqlite = new Database("database.db");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

export const sqliteDb = drizzle(sqlite, { schema });

// Hash password function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Create tables if they don't exist
export async function initializeSqliteDatabase() {
  try {
    // Create users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0 NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Create models table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        direction TEXT NOT NULL,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        document_url TEXT NOT NULL,
        automation_url TEXT,
        color TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Create shirts table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS shirts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Create combined_images table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS combined_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER REFERENCES models(id),
        shirt_id INTEGER REFERENCES shirts(id),
        image_url TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Check if default users already exist
    const existingUsers = sqlite.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    
    if (existingUsers.count === 0) {
      // Create default users
      const adminPasswordHash = await hashPassword("admin");
      const userPasswordHash = await hashPassword("user");
      const currentTime = Date.now();

      // Insert admin user
      sqlite.prepare(`
        INSERT INTO users (username, password, is_admin, created_at) 
        VALUES (?, ?, ?, ?)
      `).run("admin", adminPasswordHash, 1, currentTime);

      // Insert regular user
      sqlite.prepare(`
        INSERT INTO users (username, password, is_admin, created_at) 
        VALUES (?, ?, ?, ?)
      `).run("user", userPasswordHash, 0, currentTime);

      console.log("Default users created: admin (admin/admin) and user (user/user)");
    }

    console.log("SQLite database initialized successfully");
  } catch (error) {
    console.error("Error initializing SQLite database:", error);
  }
}