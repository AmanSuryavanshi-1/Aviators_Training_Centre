@echo off
echo Starting Sanity Studio...
echo.
cd studio
echo Installing dependencies...
call npm install
echo.
echo Starting studio on http://localhost:3333...
call npm run dev
pause