CREATE TABLE IF NOT EXISTS category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_products_name
ON category(name);