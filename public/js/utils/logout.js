// Every authenticated view ships the same sign-out confirmation modal, so the
// request lives here instead of being copied into each page module.

import { notifyError, flashSuccess, NETWORK_ERROR } from "./notify.js";

export function wireLogout() {
  const confirmButton = document.getElementById("confirm-sign-out");
  if (!confirmButton) return;

  confirmButton.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        notifyError(data.error ?? "Couldn't sign you out. Please try again.");
        return;
      }

      flashSuccess("You've been signed out.");
      window.location.href = data.redirect;
    } catch (error) {
      console.error(error);
      notifyError(NETWORK_ERROR);
    }
  });
}
