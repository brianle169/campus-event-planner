// Errors thrown with a `status` are turned into { error: message } by
// middleware/errorHandler.js. This lets a service fail without knowing that an
// HTTP response exists, which is what keeps it callable from a test.
export function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}
