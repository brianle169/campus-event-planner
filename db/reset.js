// Deletes the local SQLite file and rebuilds it from scratch: schema, then
// seed data.
// Run with: npm run db:reset

import { existsSync, rmSync } from "node:fs";
import config from "../config/env.js";

if (existsSync(config.dbPath)) {
  rmSync(config.dbPath);
  console.log(`Deleted ${config.dbPath}`);
} else {
  console.log("No existing database file to delete.");
}

// Dynamic imports (not static ones at the top of the file) are deliberate:
// db/connection.js opens its Database handle the moment it's first
// imported, so migrate.js's import of it must happen *after* the deletion
// above, not before. A static top-level import would run before any of
// this file's own code, which would reopen the old file right before we
// delete it.
await import("./migrate.js");
await import("./seed.js");
