import express from "express";
import session from "express-session";
import { join } from "node:path";
import config from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProduction,
    },
  }),
);

app.use("/public", express.static(join(config.projectRoot, "public")));
app.use(express.static(join(config.projectRoot, "views")));
app.use("/models", express.static(join(config.projectRoot, "models")));

// Map the corresponding routes to the API paths
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
// Fallback, in case none of the above matches.
app.use("/api/", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});
// Server error will be handled by the errorHandler, which returns a 500
app.use(errorHandler);

app.get("/", (req, res) => {
  res.redirect("/public/index.html");
});

export default app;
