@echo off
echo ===== StageQuest Dependency Fixer =====
echo.

echo Step 1: Cleaning npm cache
call npm cache clean --force
echo.

echo Step 2: Removing node_modules directory
if exist node_modules\ (
  echo Deleting existing node_modules folder...
  rmdir /s /q node_modules
) else (
  echo No existing node_modules folder found.
)
echo.

echo Step 3: Installing all dependencies including dev dependencies
call npm install
echo.

echo Step 4: Verifying vite installation
call npx vite --version
if %ERRORLEVEL% NEQ 0 (
  echo Vite not found, installing directly...
  call npm install vite@latest --save-dev
) else (
  echo Vite is installed correctly.
)
echo.

echo All dependencies have been reinstalled.
echo You can now run "npm run dev" to start the development server.
echo.
