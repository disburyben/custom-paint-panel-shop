
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./drizzle/schema";

console.log("Starting DB test...");
try {
    const sqlite = new Database("sqlite.db");
    console.log("Database opened.");
    const db = drizzle(sqlite, { schema });
    console.log("Drizzle initialized.");

    // Create tables if they don't exist (manual check)
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY);
  `);
    console.log("Table created.");

} catch (e) {
    console.error("Error:", e);
}
