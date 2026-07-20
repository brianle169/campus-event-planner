export const validateRegisterForm = () => {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  // Validate name
  if (!validateName()) {
    return false;
  }

  // Validate email:
  if (!validateEmail()) {
    return false;
  }

  // Validate password
  // 1. Check if the password is at least 8 characters long
  // 2. Check if the password contains at least one uppercase letter, one lowercase letter, one digit, and one special character
  if (!validatePassword()) {
    return false;
  }

  // Validate confirm password
  if (passwordInput.value !== confirmPasswordInput.value) {
    return false;
  }

  return true;
};

export const validateName = () => {
  const nameInput = document.getElementById("name");
  return nameInput.value.trim() !== "";
};

export const validateEmail = () => {
  const emailInput = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailInput.value.trim());
};

export const validatePassword = () => {
  const passwordInput = document.getElementById("password");
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return passwordRegex.test(passwordInput.value);
};
