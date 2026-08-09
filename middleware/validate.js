// Input validation middleware. This will go in most routes.
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  NAME_REGEX,
} from "../public/js/utils/inputValidation.js";
import { body, validationResult } from "express-validator";

const ROLES = ["student", "admin"];

// Shared so sign-up and the profile page's password change state the same rule.
const PASSWORD_POLICY =
  "Password must contain at least 8 characters, at least one upper-case letter and lower-case letter, at least a number, and a special character.";

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
    .withMessage(PASSWORD_POLICY),
  signInPassword: body("password")
    .notEmpty()
    .withMessage("Password cannot be empty."),
  role: body("role")
    .trim()
    .toLowerCase()
    .isIn(ROLES)
    .withMessage("Choose an account type"),
  currentPassword: body("current_password")
    .notEmpty()
    .withMessage("Current password cannot be empty."),
  newPassword: body("new_password")
    .notEmpty()
    .withMessage("New password cannot be empty.")
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_POLICY),
  confirmNewPassword: body("confirm_new_password")
    .notEmpty()
    .withMessage("Please confirm your new password.")
    .bail()
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage("Passwords do not match."),
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
