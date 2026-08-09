// Request-shape validation: is the body there, are the fields present, do they
// meet the format rules. Anything that needs a database lookup (is this email
// taken, do these credentials match) stays in the service layer.

import {
  validateName,
  validateEmail,
  validatePassword,
  validateSignInPassword,
} from "../public/js/utils/inputValidation.js";

const normalizers = {
  full_name: (value) => value.trim(),
  email: (value) => value.trim().toLowerCase(),
  role: (value) => value.trim().toLowerCase(),
};

const ROLES = ["student", "admin"];
const validateRole = (value) =>
  ROLES.includes(value) ? "" : "Choose an account type.";

export function validateBody(checks) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Request body is required." });
    }

    for (const field of Object.keys(checks)) {
      const raw = String(req.body[field] ?? "");
      req.body[field] = normalizers[field] ? normalizers[field](raw) : raw;
    }

    const fields = {};
    for (const [field, check] of Object.entries(checks)) {
      const message = check(req.body[field], req.body);
      if (message) fields[field] = message;
    }

    if (Object.keys(fields).length > 0) {
      // Keyed by field name so the client can fill the .field-error spans that
      // are already in the markup, instead of showing one generic message.
      return res
        .status(400)
        .json({ error: "Please fix the highlighted fields.", fields });
    }

    next();
  };
}

export const check = {
  full_name: validateName,
  email: validateEmail,
  password: validatePassword,
  signInPassword: validateSignInPassword,
  role: validateRole,
};

export { ROLES };
