#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cleanup() {
  echo ""
  echo "Shutting down..."
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend on port 8080..."
cd "$BACKEND_DIR"
if [[ -x "./mvnw" ]]; then
  MVN_CMD="./mvnw"
else
  MVN_CMD="mvn"
fi
"$MVN_CMD" spring-boot:run -Dspring-boot.run.arguments="--server.port=8080" &
BACKEND_PID=$!

echo "Starting frontend on port 3000..."
cd "$FRONTEND_DIR"
PORT=3000 npm run dev -- --port 3000 &
FRONTEND_PID=$!

echo ""
echo "Backend  PID: $BACKEND_PID  (http://localhost:8080)"
echo "Frontend PID: $FRONTEND_PID  (http://localhost:3000)"
echo "Press Ctrl+C to stop both."

wait
