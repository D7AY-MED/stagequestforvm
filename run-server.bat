@echo off
echo ===== StageQuest API Server Starter =====
echo.

cd server

echo Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Error: npm is not installed or not in your PATH
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

echo Checking for required packages...
if not exist node_modules\express (
  echo Installing dependencies...
  call npm install express cors path
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies!
    echo Trying with global npm...
    call npm install -g express cors path
    if %ERRORLEVEL% NEQ 0 (
      echo Error installing packages globally as well!
      pause
      exit /b 1
    )
  )
)

echo Starting API server...
echo.
echo Press Ctrl+C to stop the server when done.
echo.

node index.js

cd ..
