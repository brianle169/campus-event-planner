// import * as registerValidation from "./register.js";
// import * as loginValidation from "./login.js";
import * as validationRules from "./inputValidation.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("form.register");
  if (registerForm) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("password-confirm");

    const fields = [
      {
        input: nameInput,
        validate: () => validationRules.validateName(nameInput.value),
      },
      {
        input: emailInput,
        validate: () => validationRules.validateEmail(emailInput.value),
      },
      {
        input: passwordInput,
        validate: () => validationRules.validatePassword(passwordInput.value),
      },
      {
        input: confirmPasswordInput,
        validate: () =>
          validationRules.validateConfirmPassword(
            confirmPasswordInput.value,
            passwordInput.value,
          ),
      },
    ];

    fields.forEach((field) => {
      const debouncedValidate = debounce(() => validateField(field), delay);
      field.input.addEventListener("input", debouncedValidate);
    });

    // Re-check the confirmation field once the password itself changes.
    const debouncedRevalidateConfirm = debounce(() => {
      if (confirmPasswordInput.value) validateField(fields[3]);
    }, delay);
    passwordInput.addEventListener("input", debouncedRevalidateConfirm);

    registerForm.addEventListener("submit", (event) => {
      if (!validateAllFields(fields)) {
        event.preventDefault();
      }
    });
  }

  const loginForm = document.querySelector("form.login");
  if (loginForm) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const fields = [
      {
        input: emailInput,
        validate: () => validationRules.validateEmail(emailInput.value),
      },
      {
        input: passwordInput,
        validate: () =>
          validationRules.validateSignInPassword(passwordInput.value),
      },
    ];

    fields.forEach((field) => {
      const debouncedValidate = debounce(() => validateField(field), delay);
      field.input.addEventListener("input", debouncedValidate);
    });

    loginForm.addEventListener("submit", (event) => {
      if (!validateAllFields(fields)) {
        event.preventDefault();
      }
    });
  }
});
