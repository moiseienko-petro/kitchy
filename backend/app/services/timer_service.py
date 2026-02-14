import uuid
import time

from app.models.timer import Timer, TimerStatus
from app.db.timer_repository import TimerRepository
from app.services.sound import sound

class TimerNotFoundError(Exception):
    def __init__(self, timer_id: str):
        super().__init__(f"Timer with id={timer_id} not found")
        self.timer_id = timer_id

class TimerService:
    def __init__(self, repo: TimerRepository):
        self.repo = repo

    def list_timers(self) -> list[Timer]:
        timers = self.repo.list_timers()

        now = int(time.time())
        for timer in timers:
            if timer.status == TimerStatus.RUNNING and timer.started_at:
                elapsed = now - timer.started_at
                timer.remaining_sec = max(0, timer.remaining_sec - elapsed)

        return timers

    def create(self, name: str, duration_sec: int) -> Timer:
        timer = Timer(
            id=str(uuid.uuid4()),
            name=name,
            duration_sec=duration_sec,
            remaining_sec=duration_sec,
            status=TimerStatus.RUNNING,
            started_at=int(time.time()),
        )

        self.repo.save(timer)
        return timer

    def start(self, timer_id: str) -> Timer:
        timer = self.repo.get(timer_id)

        timer.status = TimerStatus.RUNNING
        timer.started_at = int(time.time())
        self.repo.save(timer)
        return timer

    def pause(self, timer_id: str) -> Timer:
        timer = self.repo.get(timer_id)
        if timer.status != TimerStatus.RUNNING:
            return timer

        elapsed = int(time.time()) - timer.started_at

        remaining = max(0, timer.remaining_sec - elapsed)
        timer.remaining_sec = remaining
        timer.duration_sec = remaining
        timer.status = TimerStatus.PAUSED
        timer.started_at = None

        self.repo.save(timer)
        return timer

    def delete_timer(self, timer_id: str) -> None:
        ok = self.repo.delete_timer(timer_id)
        if not ok:
            raise TimerNotFoundError(timer_id)

    def mark_timer_finished(self, timer: Timer) -> None:
        timer.status = TimerStatus.FINISHED
        timer.remaining_sec = 0
        self.repo.save(timer)

        sound.play_timer_finished()

    def get_running_timers(self) -> list[Timer]:
        timers = self.repo.list_by_status(TimerStatus.RUNNING)
        return timers

    def tick_timers(self, now_ts: int) -> None:
        timers = self.get_running_timers()

        for timer in timers:
            elapsed = now_ts - timer.started_at

            if elapsed >= timer.remaining_sec:
                self.mark_timer_finished(timer)
