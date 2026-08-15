// Input validation middleware. This will go in most routes.
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  NAME_REGEX,
} from "../public/js/utils/inputValidation.js";
import { body, param, validationResult } from "express-validator";
import { findAll as findAllCategories } from "../db/repositories/categoryRepository.js";

const ROLES = ["student", "admin"];

// Shared so sign-up and the profile page's password change state the same rule.
const PASSWORD_POLICY =
  "Password must contain at least 8 characters, at least one upper-case letter and lower-case letter, at least a number, and a special character.";

// This is for the events side of stuff
const EVENT_STATUSES = ["open", "cancelled", "completed", "disabled"];

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
  eventId: param("id")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer."),
  title: body("title").trim().notEmpty().withMessage("Title is required."),
  category: body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .bail()
    .custom((value) =>
      findAllCategories().some((c) => c.category_name === value),
    )
    .withMessage("Invalid category."),
  status: body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required.")
    .bail()
    .isIn(EVENT_STATUSES)
    .withMessage("Invalid event status."),
  // Format/required check shared by both create and edit.
  event_date_format: body("event_date")
    .trim()
    .notEmpty()
    .withMessage("Event date is required.")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Event date must be in YYYY-MM-DD format."),
  // Creation only, editing an event whose date has already passed (for example to
  // fix a typo on a completed event) must be allowed.
  event_date_not_past: body("event_date")
    .custom((value) => {
      const today = new Date();
      const date = new Date(`${value}T00:00:00`);

      today.setHours(0, 0, 0, 0);

      return date >= today;
    })
    .withMessage("Event date must be today or after today."),
  capacity: body("capacity")
    .notEmpty()
    .withMessage("Capacity is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Capacity must be greater than 0."),
  start_time: body("start_time")
    .trim()
    .notEmpty()
    .withMessage("Start time is required.")
    .bail()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Start time must be in HH:MM format."),
  end_time: body("end_time")
    .trim()
    .notEmpty()
    .withMessage("End time is required.")
    .bail()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("End time must be in HH:MM format.")
    .bail()
    .custom((value, { req }) => {
      if (!req.body.start_time) return true;

      return value > req.body.start_time;
    })
    .withMessage("End time must be after start time."),
  location: body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required."),
  registrationId: param("id")
    .isInt({ min: 1 })
    .withMessage("Registration ID must be a positive integer."),
  event_id: body("event_id")
    .notEmpty()
    .withMessage("Event ID is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer."),
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
