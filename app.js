import express from "express";
import session from "express-session";
import SqliteStoreFactory from "better-sqlite3-session-store";
import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import config from "./config/env.js";
import db from "./db/connection.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import {
  requireAuth,
  requireRole,
  requirePage,
  redirectIfAuthed,
} from "./middleware/auth.js";

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

const sendView = (file) => (req, res) =>
  res.sendFile(join(config.projectRoot, "views", file));

// Public pages routes
app.get("/", sendView("public/index.html"));
app.get("/about", sendView("public/about.html"));
app.get("/contact", sendView("public/contact.html"));
app.get("/login", redirectIfAuthed, sendView("public/login.html"));
app.get("/register", redirectIfAuthed, sendView("public/register.html"));

// Apply guard middleware to prevent student from accessing admin pages and vice versa
app.use("/student", requirePage("student"));
app.use("/admin", requirePage("admin"));

// Gated pages routes
app.get("/student/dashboard", sendView("student/student-dashboard.html"));
app.get("/student/profile", sendView("student/student-profile.html"));
app.get("/student/events", sendView("student/events.html"));
app.get("/student/events/:id", sendView("student/event-details.html"));
app.get("/student/my-registrations", sendView("student/my-registrations.html"));

app.get("/admin/dashboard", sendView("admin/admin-dashboard.html"));
app.get("/admin/events", sendView("admin/manage-events.html"));
app.get("/admin/events/new", sendView("admin/create-event.html"));
app.get("/admin/events/:id/edit", sendView("admin/edit-event.html"));
app.get("/admin/registrations", sendView("admin/event-registrations.html"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

// Managing your own account. Reads stay on GET /api/auth/me.
app.use("/api/users", requireAuth, userRoutes);

// GET /api/events can be public, in case we want to display events on public pages
app.use("/api/events", (req, res, next) => {
  if (req.method === "GET") return next();
  return requireRole("admin")(req, res, next);
});
app.use("/api/events", eventRoutes);

// Everything under /api/admin is admin-only, whatever gets added to it.
app.use("/api/admin", requireRole("admin"), adminRoutes);

// A registration always belongs to a user, so there is nothing here for an
// anonymous caller. Restricting a student to their own registrations needs
// the row's user_id, so that check belongs in the registration handlers.
app.use("/api/registrations", requireAuth, registrationRoutes);
// Fallback, in case none of the above matches.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});
// Server error will be handled by the errorHandler, which returns a 500
app.use(errorHandler);

export default app;
