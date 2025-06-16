import { sqliteDb, initializeSqliteDatabase } from "./sqlite-init";

// Initialize the database tables asynchronously
initializeSqliteDatabase().catch(console.error);

export const db = sqliteDb;
