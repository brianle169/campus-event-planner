// Every authenticated view ships the same sign-out confirmation modal, so the
// request lives here instead of being copied into each page module.

import { logOut } from "../api/authApi.js";
import { notifyError, flashSuccess, NETWORK_ERROR } from "./notify.js";

export function wireLogout() {
  const confirmButton = document.getElementById("confirm-sign-out");
  if (!confirmButton) return;

  confirmButton.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const { ok, data } = await logOut();

      if (!ok) {
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
