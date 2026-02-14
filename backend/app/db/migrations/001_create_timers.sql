CREATE TABLE IF NOT EXISTS timers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    remaining_sec INTEGER NOT NULL,
    status TEXT NOT NULL,
    started_at INTEGER
);

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
);