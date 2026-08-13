import * as validationRules from "../../utils/inputValidation.js";
import { fetchCurrentUser } from "../../api/authApi.js";
import { updateMyProfile, changeMyPassword } from "../../api/usersApi.js";
import { formatDate } from "../../utils/dateHelpers.js";
import { requireAuth } from "../../utils/authGuard.js";
import {
  notifySuccess,
  notifyError,
  NETWORK_ERROR,
} from "../../utils/notify.js";

const delay = 300; // delay in milliseconds for debouncing input validation

// The signed-in user, as the server last confirmed it. Replaced on every
// successful save so "Discard" reverts to what was actually stored.
let profile = null;

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

// The API names fields as the database does; the form ids are hyphenated.
const inputIdFor = {
  full_name: "profile-name",
  current_password: "current-password",
  new_password: "new-password",
  confirm_new_password: "confirm-new-password",
};

// Validation errors and rule failures the server can only detect against the
// database (a wrong current password) arrive in the same `fields` shape.
const showServerErrors = (fields) => {
  Object.entries(fields).forEach(([field, message]) => {
    const input = document.getElementById(inputIdFor[field]);
    if (input) setFieldError(input, message);
  });
};

// Fill the page with the signed-in user's details.
const renderProfile = (user) => {
  const roleLabel = user.role === "student" ? "Student" : "Admin";

  const headingName = document.getElementById("profile-heading-name");
  if (headingName) headingName.textContent = user.full_name;

  const roleBadge = document.getElementById("profile-role-badge");
  if (roleBadge) roleBadge.textContent = roleLabel;

  const memberSince = document.getElementById("profile-member-since");
  // SQLite stores "YYYY-MM-DD HH:MM:SS"; formatDate wants the date alone.
  if (memberSince)
    memberSince.textContent = `Member since ${formatDate(String(user.created_at).slice(0, 10))}`;

  const nameInput = document.getElementById("profile-name");
  if (nameInput) nameInput.value = user.full_name;

  const emailValue = document.getElementById("profile-email-value");
  if (emailValue) emailValue.textContent = user.email;

  const roleValue = document.getElementById("profile-role-value");
  if (roleValue) roleValue.textContent = roleLabel;
};

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth({ allowedRoles: ["student"] });
  if (!user) return;

  try {
    const { data } = await fetchCurrentUser();
    if (!data.user) {
      window.location.href = "/login";
      return;
    }
    profile = data.user;
  } catch (error) {
    console.error(error);
    notifyError(NETWORK_ERROR);
    return;
  }

  renderProfile(profile);
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

    profileInfoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateAllFields(fields)) return;

      setFieldError(nameInput, "");

      try {
        const { ok, status, data } = await updateMyProfile({
          full_name: nameInput.value,
        });

        if (ok) {
          profile = data.user;
          renderProfile(profile);
          notifySuccess("Profile updated.");
          return;
        }

        if (status === 401) {
          window.location.href = "/login";
        } else if (data.fields) {
          showServerErrors(data.fields);
        } else {
          notifyError(data.error ?? "Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error(error);
        notifyError(NETWORK_ERROR);
      }
    });

    profileInfoForm.addEventListener("reset", (event) => {
      event.preventDefault();
      nameInput.value = profile.full_name;
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

    passwordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateAllFields(fields)) return;

      fields.forEach((field) => setFieldError(field.input, ""));

      try {
        const { ok, status, data } = await changeMyPassword({
          current_password: currentPasswordInput.value,
          new_password: newPasswordInput.value,
          confirm_new_password: confirmNewPasswordInput.value,
        });

        if (ok) {
          // The server issued a new session cookie; the browser has already
          // swapped it in, so the user stays signed in here and nowhere else.
          passwordForm.reset();
          notifySuccess("Password updated.");
          return;
        }

        if (status === 401) {
          window.location.href = "/login";
        } else if (data.fields) {
          showServerErrors(data.fields);
        } else {
          notifyError(data.error ?? "Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error(error);
        notifyError(NETWORK_ERROR);
      }
    });
  }
});
