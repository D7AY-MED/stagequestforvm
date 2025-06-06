@echo off
echo ===== Starting StageQuest Development Server =====
echo.

if not exist node_modules\vite (
  echo Vite not found, running fix-dependencies.bat first...
  call fix-dependencies.bat
)

echo Starting development server...
npx vite
