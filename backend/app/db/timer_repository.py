from app.models.timer import Timer, TimerStatus
from app.db.connection import get_connection


class TimerRepository:

    def get_conn(self):
        return get_connection()

    def save(self, timer: Timer) -> None:

        conn = self.get_conn()
        conn.execute(
            """
            INSERT OR REPLACE INTO timers
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                timer.id,
                timer.name,
                timer.duration_sec,
                timer.remaining_sec,
                timer.status,
                timer.started_at,
            ),
        )
        conn.commit()

    def get(self, timer_id: str) -> Timer:
        conn = self.get_conn()

        row = conn.execute("SELECT * FROM timers WHERE id = ?", (timer_id,)).fetchone()
        return Timer(**dict(row))

    def list_by_status(self, status: TimerStatus) -> list[Timer]:
        with self.get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM timers WHERE status = ?", (status.value,)  # ← КЛЮЧОВЕ
            ).fetchall()

        return [Timer(**dict(r)) for r in rows]

    def list_timers(self) -> list[Timer]:
        conn = self.get_conn()

        rows = conn.execute("SELECT * FROM timers").fetchall()

        timers = []

        for r in rows:
            timer = Timer(**dict(r))
            timers.append(timer)

        return timers

    def delete_timer(self, timer_id: str) -> bool:
        conn = self.get_conn()

        cur = conn.cursor()

        cur.execute("DELETE FROM timers WHERE id = ? RETURNING id", (timer_id,))
        row = cur.fetchone()
        conn.commit()

        return row is not None
