// The only module that touches bcrypt. Sign-up, sign-in and the password
// change all go through here.

import bcrypt from "bcrypt";

// Matches db/seed.js, so the seeded demo accounts authenticate against this.
const SALT_ROUNDS = 10;

export function hashPassword(plainText) {
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

export function verifyPassword(plainText, hash) {
  if (!hash) return false;
  return bcrypt.compareSync(plainText, hash);
}
