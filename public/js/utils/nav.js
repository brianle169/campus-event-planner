import { fetchCurrentUser } from "../api/authApi.js";

// Public pages ship the signed-out nav in their markup. This swaps it for the
// signed-in version when there is a session, so a logged-in user visiting the
// homepage isn't told to log in again.
export async function syncNav() {
  const anonLinks = document.querySelectorAll('[data-auth="anon"]');
  const userLinks = document.querySelectorAll('[data-auth="user"]');
  if (anonLinks.length === 0 && userLinks.length === 0) return;

  let user = null;
  let dashboard = null;

  try {
    const { data } = await fetchCurrentUser();
    user = data.user;
    dashboard = data.dashboard;
  } catch (error) {
    console.log(error);
    return;
  }

  anonLinks.forEach((el) => (el.hidden = Boolean(user)));
  userLinks.forEach((el) => (el.hidden = !user));

  if (user && dashboard) {
    document
      .querySelectorAll("[data-dashboard]")
      .forEach((el) => el.setAttribute("href", dashboard));
  }
}
