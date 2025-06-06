@echo off
echo ===== Starting StageQuest API Server =====
echo.

cd server

if not exist node_modules\express (
  echo Express not found. Installing dependencies...
  call npm install
)

echo Starting API server...
node index.js

cd ..
