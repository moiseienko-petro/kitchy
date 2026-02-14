#!/bin/bash
set -e

cd "$(dirname "$0")"

# Активуємо venv
if [ -d "venv" ]; then
  source venv/bin/activate
fi

MODE=$1
if [ -z "$MODE" ]; then
  MODE="dev"
fi

export ENV=$MODE

echo "Starting backend in $ENV mode..."

if [ "$ENV" = "prod" ]; then
  cd ../frontend
  npm install
  npm run build
  cd ../backend
fi

if [ "$ENV" = "dev" ]; then
  exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload
else
  exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000
fi
