CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  created_at_ts INTEGER NOT NULL,
  external_ref TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_list
ON shopping_lists(status)
WHERE status = 'active';