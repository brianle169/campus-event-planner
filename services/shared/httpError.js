// Errors thrown with a `status` are turned into { error: message } by
// middleware/errorHandler.js. This lets a service fail without knowing that an
// HTTP response exists, which is what keeps it callable from a test.

// `fields` is optional, keyed by input name like handleValidation's output, for
// failures a chain can't catch — a wrong current password only fails against
// the database. It lets the client reuse one error path for both.
export function httpError(message, status, fields) {
  const err = new Error(message);
  err.status = status;
  if (fields) err.fields = fields;
  return err;
}
