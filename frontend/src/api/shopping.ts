import { API_BASE } from "./config";

const SHOPPING_API = `${API_BASE}/shopping`

export async function addShoppingItem(
  name: string,
  category?: string
): Promise<void> {
  const res = await fetch(`${SHOPPING_API}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category })
  });
  if (!res.ok) throw new Error("add item failed");
}

export async function listShoppingItems() {
  const res = await fetch(`${SHOPPING_API}/items`);
  if (!res.ok) throw new Error("list items failed");
  return res.json();
}

export async function updateItemQuantity(
  itemId: string,
  quantity: string
) {
  await fetch(`${SHOPPING_API}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });
}

export async function deleteShoppingItem(itemId: string) {
  await fetch(`${SHOPPING_API}/items/${itemId}`, {
    method: "DELETE"
  });
}