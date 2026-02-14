import { API_BASE } from "./config";

const PRODUCTS_API = `${API_BASE}/products`

export type Product = {
  id: string;
  name: string;
  category?: string | null;
};

export async function autocompleteProducts(q: string): Promise<Product[]> {
  const res = await fetch(
    `${PRODUCTS_API}/autocomplete?q=${encodeURIComponent(q)}`
  );
  if (!res.ok) throw new Error("autocomplete failed");
  return res.json();
}

export async function listCategories(): Promise<string[]> {
  const res = await fetch(`${PRODUCTS_API}/categories`);
  if (!res.ok) throw new Error("categories failed");
  return res.json();
}

export async function productsByCategory(category: string): Promise<Product[]> {
  const res = await fetch(
    `${PRODUCTS_API}/category/${encodeURIComponent(category)}`
  );
  if (!res.ok) throw new Error("products by category failed");
  return res.json();
}


/* ---------- LIST ---------- */

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCTS_API);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

/* ---------- UPDATE ---------- */

export async function updateProduct(
  id: string,
  data: { name: string; category: string | null }
): Promise<Product> {
  const res = await fetch(`${PRODUCTS_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
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