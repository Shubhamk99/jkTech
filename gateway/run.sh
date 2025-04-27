#!/bin/bash
# Bash script to set up and run the project from scratch
# Usage: bash ./runScript.sh

set -e

echo "[1/6] Installing dependencies..."
npm install

echo "[2/6] Running database migrations (if any)..."
# Uncomment and adjust the following line if you use TypeORM migration CLI
npm run migrations:up

echo "[3/6] Seeding database (roles, permissions, admin user)..."
npx ts-node ./db/seeds/seed-all.ts

echo "[4/6] Building the project..."
npm run build

echo "[5/6] Starting the project in production mode..."
npm run start:prod # &
# SERVER_PID=$!

# Wait a few seconds for the server to start
# sleep 10

# echo "[6/6] Running API smoke tests..."
# node ./api-smoke-test.js

# Optionally kill the server after testing
# kill $SERVER_PID

echo "All steps complete!"
