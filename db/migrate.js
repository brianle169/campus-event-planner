// Applies db/schema.sql to the database.
// Run with: npm run db:setup

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import db from "./connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "schema.sql");
const schemaSql = readFileSync(schemaPath, "utf-8");

db.exec(schemaSql);

console.log(`Schema applied to ${db.name}`);
