// Singleton database connection for the Smart Campus Event Planner server.

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import config from "../config/env.js";

mkdirSync(dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);

// Turn on foreign keys everytime we establish a connection.
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export default db;
