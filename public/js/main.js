import * as registerValidationRules from "./register.js";

document.addEventListener("DOMContentLoaded", (event) => {
  const registerForm = document.querySelector("form.register");
  registerForm.addEventListener("submit", (event) => {
    if (!registerValidationRules.validateRegisterForm()) {
      event.preventDefault();
      console.log("Form validation failed. Please check your input.");
    }
  });

  const nameInput = document.getElementById("name");
  nameInput.addEventListener("input", () => {
    if (!registerValidationRules.validateName()) {
      console.log("Invalid name.");
    }
  });

  const emailInput = document.getElementById("email");
  emailInput.addEventListener("input", () => {
    if (!registerValidationRules.validateEmail()) {
      console.log("Invalid email.");
    }
  });

  const passwordInput = document.getElementById("password");
  passwordInput.addEventListener("input", () => {
    if (!registerValidationRules.validatePassword()) {
      console.log("Invalid password.");
    }
  });
});
