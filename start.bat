@echo off
cd /d "%~dp0"
echo.
echo  World Cup 2026 Hub - Starting dev server...
echo  Your browser will open automatically at http://localhost:5173
echo  Press Ctrl+C to stop the server.
echo.
if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
)
call npm start
