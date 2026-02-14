CREATE TABLE IF NOT EXISTS shopping_items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  created_at_ts INTEGER NOT NULL,
  quantity TEXT NOT NULL DEFAULT '1',

  FOREIGN KEY(list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);