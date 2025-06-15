import { sqliteDb, initializeSqliteDatabase } from "./sqlite-init";

// Initialize the database tables
initializeSqliteDatabase();

export const db = sqliteDb;
