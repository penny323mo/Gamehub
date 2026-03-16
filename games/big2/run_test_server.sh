#!/bin/bash
echo "Starting local server for Big2 testing..."
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
open http://localhost:8000/games/big2/index.html
wait $SERVER_PID
