#!/bin/bash

# Zen App Startup Script for EC2
# This script sets up and starts both the backend server and frontend client

set -e

echo "🚀 Starting Zen Pomodoro App..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "✏️  Please edit .env with your actual RDS credentials and S3 URLs"
  exit 1
fi

# Start the backend server
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
cd server

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing server dependencies..."
  npm install
fi

# Start the server in the background
npm run dev > /tmp/zen-server.log 2>&1 &
SERVER_PID=$!
echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"

# Wait for server to be ready
echo "Waiting for server to be ready..."
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
  echo -e "${GREEN}✓ Server is running on port 4000${NC}"
else
  echo "❌ Server failed to start. Check /tmp/zen-server.log"
  exit 1
fi

# Start the frontend client
echo -e "${BLUE}🎨 Starting Frontend Client...${NC}"
cd ../client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install
fi

# Build the client for production
echo "Building client for production..."
npm run build

# Serve the client (using simple HTTP server or your preferred method)
# Option 1: Using Vite preview
# npm run preview > /tmp/zen-client.log 2>&1 &

# Option 2: Using a static server (install globally: npm install -g serve)
serve -s dist -l 3000 > /tmp/zen-client.log 2>&1 &
CLIENT_PID=$!
echo -e "${GREEN}✓ Client started (PID: $CLIENT_PID)${NC}"

# Save PIDs for later reference
echo "$SERVER_PID" > /tmp/zen-server.pid
echo "$CLIENT_PID" > /tmp/zen-client.pid

echo -e "${GREEN}✅ Zen App is running!${NC}"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}Backend:${NC} http://localhost:4000"
echo ""
echo "To stop the app, run: bash stop-zen.sh"
