// import * as registerValidation from "./register.js";
// import * as loginValidation from "./login.js";
import * as validationRules from "./utils/inputValidation.js";
import { wireLogout } from "./utils/logout.js";
import { syncNav } from "./utils/nav.js";
import {
  notifyError,
  flashSuccess,
  showFlash,
  NETWORK_ERROR,
} from "./utils/notify.js";

// Mobile nav toggle, shared by every page's header
document.querySelectorAll(".nav-toggle").forEach((toggle) => {
  const nav = toggle.closest(".nav");
  const navLinks = nav.querySelectorAll(".nav-links a, .nav-actions a");

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});

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

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateAllFields(fields)) return;

      const role = document.querySelector('input[name="role"]:checked')?.value;

      // Clear anything left from a previous attempt
      [nameInput, emailInput, passwordInput].forEach((input) =>
        setFieldError(input, ""),
      );

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            role,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          flashSuccess("Account created. Please sign in.");
          window.location.href = data.redirect;
          return;
        }

        if (res.status === 409) {
          setFieldError(emailInput, data.error);
        } else if (res.status === 400 && data.fields) {
          const inputs = {
            full_name: nameInput,
            email: emailInput,
            password: passwordInput,
          };
          Object.entries(data.fields).forEach(([field, message]) => {
            if (inputs[field]) setFieldError(inputs[field], message);
          });
        } else {
          notifyError(data.error ?? "Something went wrong, please try again.");
        }
      } catch (err) {
        console.error(err);
        notifyError(NETWORK_ERROR);
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

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateAllFields(fields)) return;

      // Clear anything left from a previous attempt
      setFieldError(emailInput, "");
      setFieldError(passwordInput, "");

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          const firstName = data.user?.full_name?.split(" ")[0];
          flashSuccess(
            firstName ? `Welcome back, ${firstName}.` : "Signed in.",
          );
          window.location.href = data.redirect;
          return;
        }

        if (res.status === 400 && data.fields) {
          const inputs = { email: emailInput, password: passwordInput };
          Object.entries(data.fields).forEach(([field, message]) => {
            if (inputs[field]) setFieldError(inputs[field], message);
          });
        } else if (res.status === 401) {
          setFieldError(passwordInput, data.error ?? "Invalid credentials.");
        } else {
          notifyError(data.error ?? "Something went wrong. Please try again.");
        }
      } catch (e) {
        console.error(e);
        notifyError(NETWORK_ERROR);
      }
    });
  }

  const contactForm = document.querySelector("form.contact");
  if (contactForm) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("text");

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
        input: messageInput,
        validate: () => validationRules.validateMessage(messageInput.value),
      },
    ];

    fields.forEach((field) => {
      const debouncedValidate = debounce(() => validateField(field), delay);
      field.input.addEventListener("input", debouncedValidate);
    });

    contactForm.addEventListener("submit", (event) => {
      if (!validateAllFields(fields)) {
        event.preventDefault();
      }
    });
  }
});

//This is for the sign out function of the nav to work
const signOutLink = document.getElementById("signOutLink");
const logoutModal = document.getElementById("logoutModal");
const noButton = document.getElementById("noButton");

if (signOutLink && logoutModal && noButton) {
  signOutLink.addEventListener("click", function (event) {
    event.preventDefault(); // Stops the link from changing the page
    logoutModal.style.display = "flex";
  });

  noButton.addEventListener("click", function (event) {
    event.preventDefault(); // Stops the # from appearing in the URL
    logoutModal.style.display = "none";
  });

  window.addEventListener("pageshow", function (event) {
    logoutModal.style.display = "none";
    if (!event.persisted) return;

    if (document.querySelector("[data-auth]")) syncNav();
    else window.location.reload();
  });
}

wireLogout();
syncNav();
showFlash();
