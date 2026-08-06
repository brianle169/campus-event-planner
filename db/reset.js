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

await import("./migrate.js");
await import("./seed.js");
