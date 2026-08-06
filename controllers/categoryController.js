import { findAll } from "../db/repositories/categoryRepository.js";

export function listCategories(req, res) {
  res.json(findAll());
}
