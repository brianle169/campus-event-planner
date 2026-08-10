// This file loads environment variables from a .env file into process.env,
// validates the ones this app actually depends on, and exports a single
// frozen config object so nothing else in the codebase reads process.env
// directly — everyone imports `config` from here instead.

import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

dotenv.config({ path: join(projectRoot, ".env") });

// Fail fast: if a required secret is missing, crash on startup with a clear
// message instead of letting express-session silently sign cookies with the
// string "undefined".
const required = ["SESSION_SECRET", "PORT", "DB_PATH", "NODE_ENV"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      "Copy .env.example to .env and fill in real values.",
  );
}

const config = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  sessionSecret: process.env.SESSION_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  dbPath: process.env.DB_PATH || join(projectRoot, "data", "campus_planner.db"),
  projectRoot: projectRoot,
});

export default config;
