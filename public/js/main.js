import * as registerValidation from "./register.js";

const delay = 300; // delay in milliseconds for debouncing input validation

const debounce = (fn, delayMs) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
};

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("form.register");
  if (!registerForm) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("password-confirm");

  const setFieldError = (input, message) => {
    const errorEl = document.getElementById(`${input.id}-error`);
    input.classList.toggle("invalid", Boolean(message));
    if (errorEl) errorEl.textContent = message;
  };

  const fields = [
    {
      input: nameInput,
      validate: () => registerValidation.validateName(nameInput.value),
    },
    {
      input: emailInput,
      validate: () => registerValidation.validateEmail(emailInput.value),
    },
    {
      input: passwordInput,
      validate: () => registerValidation.validatePassword(passwordInput.value),
    },
    {
      input: confirmPasswordInput,
      validate: () =>
        registerValidation.validateConfirmPassword(
          confirmPasswordInput.value,
          passwordInput.value,
        ),
    },
  ];

  const validateField = (field) => {
    const message = field.validate();
    setFieldError(field.input, message);
    return message === "";
  };

  const validateAllFields = () =>
    fields.reduce((allValid, field) => validateField(field) && allValid, true);

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
    if (!validateAllFields()) {
      event.preventDefault();
    }
  });
});
