from pathlib import Path
from app.db.connection import get_connection

MIGRATIONS_PATH = Path("app/db/migrations")


def init_db():
    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY
        );
    """)

    current = conn.execute(
        "SELECT MAX(version) FROM schema_version"
    ).fetchone()[0] or 0

    migrations = sorted(MIGRATIONS_PATH.glob("*.sql"))

    for m in migrations:
        version = int(m.name.split("_")[0])
        if version > current:
            conn.executescript(m.read_text())
            conn.execute(
                "INSERT INTO schema_version (version) VALUES (?)",
                (version,)
            )

    conn.execute(
        """
        INSERT OR IGNORE INTO category (id, name)
        VALUES (?, ?)
        """,
        ("00000000-0000-0000-0000-000000000000", "Other"),
    )
    
    conn.commit()
    conn.close()