// Input validation middleware. This will go in most routes.
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  NAME_REGEX,
} from "../public/js/utils/inputValidation.js";
import { body, validationResult } from "express-validator";

const ROLES = ["student", "admin"];

export const validationRules = {
  full_name: body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name required.")
    .bail()
    .matches(NAME_REGEX)
    .withMessage(
      "Full name must have only letters, spaces, hyphens and apostrophies.",
    ),
  email: body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email required.")
    .bail()
    .matches(EMAIL_REGEX)
    .withMessage("Invalid email address."),
  password: body("password")
    .notEmpty()
    .withMessage("Password cannot be empty.")
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must contain at least 8 characters, at least one upper-case letter and lower-case letter, at least a number, and a special character.",
    ),
  signInPassword: body("password")
    .notEmpty()
    .withMessage("Password cannot be empty."),
  role: body("role")
    .trim()
    .toLowerCase()
    .isIn(ROLES)
    .withMessage("Choose an account type"),
};

export function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next(); // all good and dandy

  const fields = {};
  for (const [field, err] of Object.entries(result.mapped())) {
    fields[field] = err.msg;
  }

  return res.status(400).json({ error: "Invalid inputs.", fields });
}

export const validate = (...chains) => [...chains, handleValidation];
