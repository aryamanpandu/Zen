#!/bin/bash

# Zen App Stop Script
# This script stops both the backend server and frontend client

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

if [ -f "/tmp/zen-server.pid" ]; then
  SERVER_PID=$(cat /tmp/zen-server.pid)
  if kill -0 $SERVER_PID 2>/dev/null; then
    kill $SERVER_PID
    echo -e "${GREEN}✓ Server stopped (PID: $SERVER_PID)${NC}"
    rm /tmp/zen-server.pid
  fi
fi

if [ -f "/tmp/zen-client.pid" ]; then
  CLIENT_PID=$(cat /tmp/zen-client.pid)
  if kill -0 $CLIENT_PID 2>/dev/null; then
    kill $CLIENT_PID
    echo -e "${GREEN}✓ Client stopped (PID: $CLIENT_PID)${NC}"
    rm /tmp/zen-client.pid
  fi
fi

echo -e "${GREEN}✅ Zen App stopped${NC}"
