// toast.js is loaded as a classic script (the rest of the app relies on its
// data-toast attribute handlers), so it can't be imported from a module. It
// publishes showToast on window instead; this wrapper keeps that lookup — and
// the fallback for pages that don't load it — in one place.

function notify(message, type) {
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
  } else if (type === "error") {
    console.error(message);
  } else {
    console.log(message);
  }
}

export function notifyError(message) {
  notify(message, "error");
}

export function notifySuccess(message) {
  notify(message, "success");
}

export const NETWORK_ERROR =
  "Couldn't reach the server. Check your connection and try again.";

const FLASH_KEY = "flash-toast";

export function flashSuccess(message) {
  try {
    sessionStorage.setItem(
      FLASH_KEY,
      JSON.stringify({ message, type: "success" }),
    );
  } catch {}
}

// Called once per page load from main.js. Reads and clears any pending message.
export function showFlash() {
  let payload;
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return;
    sessionStorage.removeItem(FLASH_KEY);
    payload = JSON.parse(raw);
  } catch {
    return;
  }
  if (payload && payload.message) notify(payload.message, payload.type);
}
