#!/bin/bash

APP_DIR="/home/kitchy/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

export XDG_RUNTIME_DIR=/tmp/cage-runtime
mkdir -p $XDG_RUNTIME_DIR
chmod 700 $XDG_RUNTIME_DIR

export WLR_NO_HARDWARE_CURSORS=1
export WLR_CURSOR_THEME=blank

cleanup() {
    echo ""
    echo "Stopping all processes..."

    kill -TERM -$BACKEND_PGID 2>/dev/null
    kill -TERM -$FRONTEND_PGID 2>/dev/null
    kill -TERM -$CAGE_PGID 2>/dev/null

    sleep 1

    kill -KILL -$BACKEND_PGID 2>/dev/null
    kill -KILL -$FRONTEND_PGID 2>/dev/null
    kill -KILL -$CAGE_PGID 2>/dev/null

    echo "Stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Cleaning old processes..."
pkill -f uvicorn
pkill -f vite
pkill -f chromium
pkill -f cage

sleep 1

echo "Starting backend (dev)..."
cd "$BACKEND_DIR"
setsid ./run.sh dev &
BACKEND_PID=$!
BACKEND_PGID=$(ps -o pgid= $BACKEND_PID | tr -d ' ')

echo "Waiting for backend..."
until curl -s http://localhost:8000 > /dev/null; do
    sleep 1
done

echo "Starting frontend (vite dev)..."
cd "$FRONTEND_DIR"
setsid npm run dev -- --host &
FRONTEND_PID=$!
FRONTEND_PGID=$(ps -o pgid= $FRONTEND_PID | tr -d ' ')

echo "Waiting for frontend..."
until curl -s http://localhost:5173 > /dev/null; do
    sleep 1
done

echo "Starting kiosk..."
cd "$APP_DIR"
setsid ./start-kiosk-dev.sh &
CAGE_PID=$!
CAGE_PGID=$(ps -o pgid= $CAGE_PID | tr -d ' ')

wait $CAGE_PID
cleanup
