@echo off
echo ===== Setting up StageQuest API Server =====
echo.

echo Creating necessary directories...
if not exist server mkdir server
if not exist server\public mkdir server\public

echo.
echo Copying files...
copy /y run-server.bat run-server.bat > nul
echo - Copied run-server.bat
echo.

echo Setup complete!
echo.
echo To start the server, run the following command:
echo run-server.bat
echo.
echo Then visit: http://localhost:3000
echo.
pause
