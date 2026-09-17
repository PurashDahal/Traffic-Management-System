#!/bin/bash

echo "================================================================="
echo "   AI-Assisted Digital Traffic Violation Management System       "
echo "================================================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Backend (Spring Boot)..."
cd "$PROJECT_ROOT/backend"
mvn spring-boot:run &
BACKEND_PID=$!

echo "Starting Frontend (React Vite)..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo "Backend running on http://localhost:8080"
echo "Frontend running on http://localhost:5173"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
