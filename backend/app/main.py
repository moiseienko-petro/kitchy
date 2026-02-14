from fastapi import FastAPI
from contextlib import asynccontextmanager

import threading
import os

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.init_db import init_db
from app.api.timers import router as timers_router
from app.api.shopping import router as shopping_router
from app.api.products import router as products_router
from app.scheduler.timer_loop import run_timer_loop

ENV = os.getenv("ENV", "dev")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup only
    init_db()
    start_scheduler()
    yield
    # nothing on shutdown

def start_scheduler():
    thread = threading.Thread(
        target=run_timer_loop,
        daemon=True
    )
    thread.start()

app = FastAPI(lifespan=lifespan, title="Kitchy Backend")
app.include_router(timers_router)
app.include_router(shopping_router)
app.include_router(products_router)

if ENV == "dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

if ENV == "prod":
    app.mount(
        "/",
        StaticFiles(directory="../frontend_dist", html=True),
        name="frontend",
    )