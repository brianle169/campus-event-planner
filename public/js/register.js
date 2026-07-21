const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Each validator takes the relevant field value(s) and returns an error
// message, or "" when the value is valid.

export const validateName = (value) => {
  if (!value.trim()) return "Full name is required.";
  return "";
};

export const validateEmail = (value) => {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address.";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Password is required.";
  if (!PASSWORD_REGEX.test(value)) {
    return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";
  }
  return "";
};

export const validateConfirmPassword = (value, passwordValue) => {
  if (!value) return "Please confirm your password.";
  if (value !== passwordValue) return "Passwords do not match.";
  return "";
};
