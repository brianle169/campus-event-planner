import config from "../config/env.js";

export default function errorHandler(err, req, res, next) {
  if (!config.isProduction) {
    console.error(err.stack);
  }

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(status).json({ error: message });
}
