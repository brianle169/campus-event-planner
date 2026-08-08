import express from "express";
import session from "express-session";
import SqliteStoreFactory from "better-sqlite3-session-store";
import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import config from "./config/env.js";
import db from "./db/connection.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const SqliteStore = SqliteStoreFactory(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(join(config.projectRoot, "public")));
// app.use(express.static(join(config.projectRoot, "views")));
// This will be removed once the sampleData.js is no longer needed
app.use("/models", express.static(join(config.projectRoot, "models")));

app.use(
  session({
    // MemoryStore under test because the store's expired-session sweep uses a
    // setInterval it never hands back, so node --test would never exit.
    store:
      config.nodeEnv === "test"
        ? undefined
        : new SqliteStore({
            client: db,
            expired: { clear: true, intervalMs: 900000 }, // 15 min
          }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProduction,
    },
  }),
);

app.get("/", (req, res) => {
  res.sendFile(join(config.projectRoot, "views/public/index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(join(config.projectRoot, "views/public/about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(join(config.projectRoot, "views/public/contact.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(join(config.projectRoot, "views/public/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(join(config.projectRoot, "views/public/register.html"));
});

app.get("/student/dashboard", (req, res) => {
  res.sendFile(
    join(config.projectRoot, "views/student/student-dashboard.html"),
  );
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(join(config.projectRoot, "views/admin/admin-dashboard.html"));
});

// Map the corresponding routes to the API paths
app.use("/api/auth", authRoutes);
// app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/registrations", registrationRoutes);
// Fallback, in case none of the above matches.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});
// Server error will be handled by the errorHandler, which returns a 500
app.use(errorHandler);

export default app;
