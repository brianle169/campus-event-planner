import db from "../connection.js";

const selectAll = db.prepare(
  "SELECT category_id, category_name, description FROM categories ORDER BY category_name",
);

export function findAll() {
  return selectAll.all();
}
