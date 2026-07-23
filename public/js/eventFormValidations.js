const setFieldError = (input, message) => {
  const errorEl = document.getElementById(`${input.id}-error`);
  input.classList.toggle('invalid', Boolean(message));

  if (errorEl) {
    errorEl.textContent = message;
  }
};

const validateField = (input) => {
  const message = input.value.trim() ? '' : 'Field is required.';
  setFieldError(input, message);
  return message === '';
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.event-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');

  const validateAllFields = () => {
    let valid = true;

    inputs.forEach((input) => {
      if (input.hasAttribute('readonly')) return;
      if (input.type === 'submit' || input.type === 'button') return;
      if (!validateField(input)) valid = false;
    });

    return valid;
  };

  // Clear error messages on input or change events
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        setFieldError(input, '');
      }
    });

    input.addEventListener('change', () => {
      if (input.value.trim()) {
        setFieldError(input, '');
      }
    });
  });

  form.addEventListener('submit', (event) => {
    form.dataset.valid = 'false';
    if (!validateAllFields()) {
      event.preventDefault();
      return;
    }
    form.dataset.valid = 'true';
  });
});
