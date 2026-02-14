#!/bin/bash

XDG_RUNTIME_DIR=/tmp/cage-runtime \
mkdir -p /tmp/cage-runtime && \
chmod 700 /tmp/cage-runtime && \
XDG_RUNTIME_DIR=/tmp/cage-runtime \

cage -- chromium \
  --no-sandbox \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate \
  --disable-features=TranslateUI \
  --autoplay-policy=no-user-gesture-required \
  http://localhost:5173
