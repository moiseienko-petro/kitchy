import { API_BASE } from "./config";

const CATEGORIES_API = `${API_BASE}/categories`;

/* ---------- TYPES ---------- */

export type Category = {
  id: string;
  name: string;
};

/* ---------- LIST ---------- */

export async function listCategories(): Promise<Category[]> {
  const res = await fetch(CATEGORIES_API);

  if (!res.ok) throw new Error("Failed to load categories");

  return res.json();
}

/* ---------- CREATE ---------- */

export async function createCategory(name: string): Promise<Category> {
  const res = await fetch(CATEGORIES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to create category");

  return res.json();
}

/* ---------- UPDATE ---------- */

export async function updateCategory(
  id: string,
  name: string
): Promise<Category> {
  const res = await fetch(`${CATEGORIES_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to update category");

  return res.json();
}

/* ---------- DELETE ---------- */

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${CATEGORIES_API}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete category");
}