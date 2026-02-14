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