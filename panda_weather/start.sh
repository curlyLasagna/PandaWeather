#!/bin/bash

# -------------------------
# CONFIG
# -------------------------
VITE_PORT=5173
VITE_CMD="npm run dev"  # Your frontend start command

# Make sure localtunnel is installed
command -v lt >/dev/null 2>&1 || { echo "Installing localtunnel..."; npm install -g localtunnel; }

# -------------------------
# START VITE
# -------------------------
echo "Starting Vite frontend..."
$VITE_CMD &
VITE_PID=$!
sleep 3  # give Vite time to start

# -------------------------
# START LOCALTUNNEL IN BACKGROUND
# -------------------------
echo "Starting LocalTunnel..."
lt --port $VITE_PORT --print-requests > lt.log 2>&1 &
LT_PID=$!

# -------------------------
# WAIT FOR PUBLIC URL
# -------------------------
LT_URL=""
echo -n "Waiting for LocalTunnel URL"
while [[ -z "$LT_URL" ]]; do
    sleep 1
    echo -n "."
    LT_URL=$(grep -o 'https://[a-z0-9.-]*' lt.log | head -n 1)
done
echo
echo "LocalTunnel URL detected: $LT_URL"

# -------------------------
# SHORTEN URL VIA IS.GD
# -------------------------
SHORT_URL=$(curl -s "https://is.gd/create.php?format=simple&url=$LT_URL")

if [[ -n "$SHORT_URL" ]]; then
    echo "Short URL: $SHORT_URL"
    # Copy to Windows clipboard (WSL)
    echo "$SHORT_URL" | /mnt/c/Windows/System32/clip.exe
    echo "Short URL copied to clipboard!"
else
    echo "Failed to shorten URL."
fi

# -------------------------
# CLEANUP ON EXIT
# -------------------------
cleanup() {
    echo "Stopping Vite and LocalTunnel..."
    kill $VITE_PID $LT_PID
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
