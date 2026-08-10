// Every request the browser makes to the Express API goes through here, so the
// JSON headers, the body encoding, and the response parsing live in one place
// instead of being copied into each page module.
//
// A non-2xx answer is NOT an exception. The API replies to 400/401/409 with a
// JSON body the caller still needs (per-field messages, an error string), so
// those come back as an ordinary result with `ok: false`. Only a request that
// never reached the server rejects — that's what the callers' try/catch and
// their NETWORK_ERROR toast are for.

async function request(method, path, payload) {
  const options = { method };

  // Sending `undefined` as a body would still set a Content-Type the server
  // has no use for, so bodyless verbs (GET, and POST /logout) skip both.
  if (payload !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(path, options);
  // A 204, or an error page from something in front of Express, isn't JSON.
  // Callers only ever read named fields off this, so {} is a safe stand-in.
  const data = await response.json().catch(() => ({}));

  return { ok: response.ok, status: response.status, data };
}

export const get = (path) => request("GET", path);
export const post = (path, payload) => request("POST", path, payload);
export const patch = (path, payload) => request("PATCH", path, payload);
export const put = (path, payload) => request("PUT", path, payload);
export const del = (path) => request("DELETE", path);
