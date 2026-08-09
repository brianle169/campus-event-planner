import config from "../config/env.js";

export default function errorHandler(err, req, res, next) {
  if (!config.isProduction) {
    console.error(err.stack);
  }

  const status = err.status || 500;
  const fallback = "Something went wrong";
  const message = status >= 500 ? fallback : err.message || fallback;

  // this prevents leaking of internal data
  if (status < 500 && err.fields) {
    return res.status(status).json({ error: message, fields: err.fields });
  }

  res.status(status).json({ error: message });
}
