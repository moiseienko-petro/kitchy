import { API_BASE } from "./config";

const PRODUCTS_API = `${API_BASE}/products`;

/* ---------- TYPES ---------- */

export type Product = {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
};

/* ---------- AUTOCOMPLETE ---------- */

export async function autocompleteProducts(q: string): Promise<Product[]> {
  const res = await fetch(
    `${PRODUCTS_API}/autocomplete?q=${encodeURIComponent(q)}`
  );

  if (!res.ok) throw new Error("Autocomplete failed");

  return res.json();
}

/* ---------- LIST ---------- */

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCTS_API);

  if (!res.ok) throw new Error("Failed to load products");

  return res.json();
}

/* ---------- GET BY ID ---------- */

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${PRODUCTS_API}/${id}`);

  if (!res.ok) throw new Error("Failed to load product");

  return res.json();
}

/* ---------- CREATE ---------- */

export async function createProduct(data: {
  name: string;
  category_name?: string | null;
}): Promise<Product> {
  const res = await fetch(PRODUCTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create product");

  return res.json();
}

/* ---------- UPDATE ---------- */

export async function updateProduct(
  id: string,
  data: { name?: string; category_name?: string | null }
): Promise<Product> {
  const res = await fetch(`${PRODUCTS_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update product");

  return res.json();
}

/* ---------- DELETE ---------- */

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${PRODUCTS_API}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete product");
}