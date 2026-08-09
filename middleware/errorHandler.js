import config from "../config/env.js";

export default function errorHandler(err, req, res, next) {
  if (!config.isProduction) {
    console.error(err.stack);
  }

  const status = err.status || 500;
  const fallback = "Something went wrong";
  const message = status >= 500 ? fallback : err.message || fallback;

  res.status(status).json({ error: message });
}
