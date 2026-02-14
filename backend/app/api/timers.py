from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.container import timer_service

router = APIRouter(prefix="/api/timers")


class CreateTimerRequest(BaseModel):
    duration_sec: int
    name: Optional[str] = None


@router.post("")
def create_timer(req: CreateTimerRequest):
    return timer_service.create(name=req.name, duration_sec=req.duration_sec)


@router.get("")
def list_timers():
    return timer_service.list_timers()


@router.post("/{timer_id}/pause")
def pause_timer(timer_id: str):
    return timer_service.pause(timer_id)

@router.post("/{timer_id}/start")
def start_timer(timer_id: str):
    return timer_service.start(timer_id)


@router.delete("/{timer_id}")
def delete_timer_endpoint(timer_id: str):
    ok = timer_service.delete_timer(timer_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Timer not found")
    return {"status": "deleted"}
