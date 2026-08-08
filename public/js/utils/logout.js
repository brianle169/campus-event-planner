// Every authenticated view ships the same sign-out confirmation modal, so the
// request lives here instead of being copied into each page module.

export function wireLogout() {
  const confirmButton = document.getElementById("confirm-sign-out");
  if (!confirmButton) return;

  confirmButton.addEventListener("click", async (event) => {
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
  });
}
