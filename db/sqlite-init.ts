import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Create SQLite database connection
const sqlite = new Database("database.db");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

export const sqliteDb = drizzle(sqlite, { schema });

// Create tables if they don't exist
export function initializeSqliteDatabase() {
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

    console.log("SQLite database initialized successfully");
  } catch (error) {
    console.error("Error initializing SQLite database:", error);
  }
}