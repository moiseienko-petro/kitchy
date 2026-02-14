#!/bin/bash
set -e

USER_ID=$(id -u)
RUNTIME_DIR="/run/user/$USER_ID"

echo "Waiting for Wayland socket in $RUNTIME_DIR ..."

while true; do
  SOCKET=$(ls "$RUNTIME_DIR"/wayland-* 2>/dev/null | head -n 1 || true)
  if [ -n "$SOCKET" ]; then
    break
  fi
  sleep 0.5
done

export XDG_RUNTIME_DIR="$RUNTIME_DIR"
export WAYLAND_DISPLAY="$(basename "$SOCKET")"

echo "Using WAYLAND_DISPLAY=$WAYLAND_DISPLAY"

exec /usr/bin/chromium \
  --ozone-platform=wayland \
  --enable-features=UseOzonePlatform \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  http://localhost:8000
