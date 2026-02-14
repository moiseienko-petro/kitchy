import time
from app.services.container import timer_service

def run_timer_loop():
    while True:
        now = int(time.time())
        timer_service.tick_timers(now)
        time.sleep(1)