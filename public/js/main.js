// import * as registerValidation from "./register.js";
// import * as loginValidation from "./login.js";
import * as validationRules from "./utils/inputValidation.js";

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

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!validateAllFields(fields)) {
        event.preventDefault();
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const { error } = await res.json();
          setFieldError(emailInput, error);
          setFieldError(passwordInput, error);
          return;
        }

        const { redirect } = await res.json();
        window.location.href = redirect;
      } catch (e) {
        console.error(e);
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

  // const confirmLogOutButton = document.getElementById("confirm-sign-out");
  // confirmLogOutButton.addEventListener("click", async (event) => {
  //   event.preventDefault();
  //   try {
  //     const res = await fetch("/api/auth/logout", {
  //       method: "POST",
  //     });

  //     if (!res.ok) {
  //       const { error } = await res.json();
  //       console.log(error);
  //       return;
  //     }

  //     const { redirect } = await res.json();
  //     window.location.href = redirect;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
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

  window.addEventListener("pageshow", function () {
    logoutModal.style.display = "none";
  });
}

export const confirmLogOutButtonEvent = async (event) => {
  event.preventDefault();
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!res.ok) {
      const { error } = await res.json();
      console.log(error);
      return;
    }

    const { redirect } = await res.json();
    window.location.href = redirect;
  } catch (error) {
    console.log(error);
  }
};
