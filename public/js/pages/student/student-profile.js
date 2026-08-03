import * as validationRules from "../../utils/inputValidation.js";
import { currentUser } from "../../data/sampleData.js";
import { formatDate } from "../../utils/dateHelpers.js";

const delay = 300; // delay in milliseconds for debouncing input validation

const debounce = (fn, delayMs) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
};

const setFieldError = (input, message) => {
  const errorEl = document.getElementById(`${input.id}-error`);
  input.classList.toggle("invalid", Boolean(message));
  if (errorEl) errorEl.textContent = message;
};

const validateField = (field) => {
  const message = field.validate();
  setFieldError(field.input, message);
  return message === "";
};

const validateAllFields = (fields) =>
  fields.reduce((allValid, field) => validateField(field) && allValid, true);

const wireLiveValidation = (fields) => {
  fields.forEach((field) => {
    const debouncedValidate = debounce(() => validateField(field), delay);
    field.input.addEventListener("input", debouncedValidate);
  });
};

// Fill the page with the signed-in user's details from the sample data.
const renderProfile = () => {
  const roleLabel = currentUser.role === "student" ? "Student" : "Organizer";

  const headingName = document.getElementById("profile-heading-name");
  if (headingName) headingName.textContent = currentUser.full_name;

  const roleBadge = document.getElementById("profile-role-badge");
  if (roleBadge) roleBadge.textContent = roleLabel;

  const memberSince = document.getElementById("profile-member-since");
  if (memberSince)
    memberSince.textContent = `Member since ${formatDate(currentUser.created_at)}`;

  const nameInput = document.getElementById("profile-name");
  if (nameInput) nameInput.value = currentUser.full_name;

  const emailValue = document.getElementById("profile-email-value");
  if (emailValue) emailValue.textContent = currentUser.email;

  const roleValue = document.getElementById("profile-role-value");
  if (roleValue) roleValue.textContent = roleLabel;
};

document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
  // ----- Personal information form (only the name is editable) -----
  const profileInfoForm = document.getElementById("profile-info-form");
  if (profileInfoForm) {
    const nameInput = document.getElementById("profile-name");

    const fields = [
      {
        input: nameInput,
        validate: () => validationRules.validateName(nameInput.value),
      },
    ];

    wireLiveValidation(fields);

    profileInfoForm.addEventListener("submit", (event) => {
      event.preventDefault(); // No backend yet (Deliverable 1).
      validateAllFields(fields);
    });

    profileInfoForm.addEventListener("reset", (event) => {
      event.preventDefault();
      nameInput.value = currentUser.full_name;
      fields.forEach((field) => setFieldError(field.input, ""));
    });
  }

  // ----- Change password form -----
  const passwordForm = document.getElementById("password-form");
  if (passwordForm) {
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmNewPasswordInput = document.getElementById(
      "confirm-new-password",
    );

    const fields = [
      {
        input: currentPasswordInput,
        validate: () =>
          validationRules.validateSignInPassword(currentPasswordInput.value),
      },
      {
        input: newPasswordInput,
        validate: () =>
          validationRules.validatePassword(newPasswordInput.value),
      },
      {
        input: confirmNewPasswordInput,
        validate: () =>
          validationRules.validateConfirmPassword(
            confirmNewPasswordInput.value,
            newPasswordInput.value,
          ),
      },
    ];

    fields.forEach((field) => {
      const debouncedValidate = debounce(() => validateField(field), delay);
      field.input.addEventListener("input", debouncedValidate);
    });

    // Re-check the confirmation field when the new password itself changes,
    // otherwise a stale "Passwords do not match" error can linger.
    const revalidateConfirm = debounce(() => {
      if (confirmNewPasswordInput.value) validateField(fields[2]);
    }, delay);
    newPasswordInput.addEventListener("input", revalidateConfirm);

    passwordForm.addEventListener("submit", (event) => {
      event.preventDefault(); // No backend yet (Deliverable 1).
      validateAllFields(fields);
    });
  }
});