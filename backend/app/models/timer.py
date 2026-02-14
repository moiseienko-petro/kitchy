from enum import Enum
from typing import Optional
from pydantic import BaseModel


class TimerStatus(str, Enum):
    RUNNING = "running"
    PAUSED = "paused"
    FINISHED = "finished"

class Timer(BaseModel):
    id: str
    name: str
    duration_sec: int
    remaining_sec: int
    status: TimerStatus
    started_at: Optional[int] = None
