// Simple toast, based on:
// https://webdesign.tutsplus.com/how-to-code-an-animated-toast-notification-with-javascript--cms-107844t
//
// Two ways to use it:
//   1. Call showToast("Message") from any script.
//   2. Add data-toast="Message" (and optional data-toast-type="error") on
//      any form or button; a toast will fire on submit / click.
//
// This script relies on `defer` so the DOM is ready when it runs.

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-toast]");
  if (!trigger) return;
  if (trigger.tagName === "FORM") return;
  showToast(trigger.dataset.toast, trigger.dataset.toastType || "success");
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-toast]");
  if (!form) return;
  if (form.dataset.valid === "false") return;
  event.preventDefault();
  showToast(form.dataset.toast, form.dataset.toastType || "success");
});
