@echo off
echo Fixing Sanity Studio React Hook Issues...

cd studio

echo Removing node_modules...
rmdir /s /q node_modules 2>nul

echo Removing package-lock.json...
del package-lock.json 2>nul

echo Installing clean dependencies...
npm install

echo Studio fixed! You can now run:
echo cd studio
echo npm run dev-3334

pause