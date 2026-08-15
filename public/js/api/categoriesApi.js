import { get } from "./client.js";

// GET /api/categories responds with the raw array (not wrapped in an
// object), so res.data is already the list.
export async function fetchCategories() {
  const res = await get("/api/categories");
  return res.data || [];
}
