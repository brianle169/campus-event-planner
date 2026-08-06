import express from "express";
import path, { join } from "path";
import config from "./config/env.js";
import { fileURLToPath } from "url";

const app = express();

app.use("/public", express.static(join(config.projectRoot, "public")));
app.use(express.static(join(config.projectRoot, "views")));
app.use("/models", express.static(join(config.projectRoot, "models")));

app.get("/", (req, res) => {
  res.redirect("/public/index.html");
});

export default app;
