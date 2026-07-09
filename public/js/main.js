// This is the main JavaScript file for the Smart Campus Event Planner application. It handles user interactions and dynamic content on the front-end.
// *NOTE: app.js will be the main entry point for the application, and it will import and use this main.js file for front-end functionality.

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initLoginForm();
  initRegisterForm();
  initContactForm();
});

function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function setFieldError(field, message) {
  const group = field.closest(".form-group");
  if (!group) return;
  const errorEl = group.querySelector(".error-message");
  if (message) {
    group.classList.add("invalid");
    if (errorEl) errorEl.textContent = message;
  } else {
    group.classList.remove("invalid");
    if (errorEl) errorEl.textContent = "";
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const status = document.getElementById("login-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;

    const email = form.querySelector("#email");
    const password = form.querySelector("#password");

    if (!isValidEmail(email.value.trim())) {
      setFieldError(email, "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError(email, "");
    }

    if (password.value.length < 8) {
      setFieldError(password, "Password must be at least 8 characters.");
      valid = false;
    } else {
      setFieldError(password, "");
    }

    if (!valid) {
      if (status) {
        status.textContent = "Please fix the errors below and try again.";
        status.className = "form-status error";
      }
      return;
    }

    if (status) {
      status.textContent = "Login successful. Redirecting to your dashboard...";
      status.className = "form-status success";
    }
    form.reset();
  });
}

function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const status = document.getElementById("register-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;

    const fullName = form.querySelector("#full-name");
    const email = form.querySelector("#email");
    const password = form.querySelector("#password");
    const confirmPassword = form.querySelector("#confirm-password");

    if (fullName.value.trim().length < 2) {
      setFieldError(fullName, "Enter your full name.");
      valid = false;
    } else {
      setFieldError(fullName, "");
    }

    if (!isValidEmail(email.value.trim())) {
      setFieldError(email, "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError(email, "");
    }

    if (password.value.length < 8) {
      setFieldError(password, "Password must be at least 8 characters.");
      valid = false;
    } else {
      setFieldError(password, "");
    }

    if (confirmPassword.value !== password.value || confirmPassword.value === "") {
      setFieldError(confirmPassword, "Passwords do not match.");
      valid = false;
    } else {
      setFieldError(confirmPassword, "");
    }

    if (!valid) {
      if (status) {
        status.textContent = "Please fix the errors below and try again.";
        status.className = "form-status error";
      }
      return;
    }

    if (status) {
      status.textContent = "Account created successfully. You can now log in.";
      status.className = "form-status success";
    }
    form.reset();
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");

    if (name.value.trim().length < 2) {
      setFieldError(name, "Enter your name.");
      valid = false;
    } else {
      setFieldError(name, "");
    }

    if (!isValidEmail(email.value.trim())) {
      setFieldError(email, "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError(email, "");
    }

    if (message.value.trim().length < 10) {
      setFieldError(message, "Message must be at least 10 characters.");
      valid = false;
    } else {
      setFieldError(message, "");
    }

    if (!valid) {
      if (status) {
        status.textContent = "Please fix the errors below and try again.";
        status.className = "form-status error";
      }
      return;
    }

    if (status) {
      status.textContent = "Thanks for reaching out! We'll get back to you soon.";
      status.className = "form-status success";
    }
    form.reset();
  });
}
