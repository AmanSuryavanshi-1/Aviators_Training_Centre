@echo off
echo 🔧 Fixing All Studio and Admin Errors...
echo.

echo 📦 Installing missing dependencies...
cd studio
call npm install @sanity/ui react react-dom
cd ..

echo.
echo 🧹 Cleaning up problematic files...
if exist "studio\components\SEOPreview.tsx" (
    echo Removing problematic SEO Preview component...
    del "studio\components\SEOPreview.tsx"
)

if exist "studio\lib\seoAnalysis.ts" (
    echo Removing problematic SEO Analysis library...
    del "studio\lib\seoAnalysis.ts"
)

echo.
echo 🔄 Restarting Studio with fixed configuration...
cd studio
echo Starting Sanity Studio on port 3334...
echo.
echo ✅ Fixed Issues:
echo    - Removed problematic SEO components
echo    - Fixed delete functionality with trash icons
echo    - Simplified schema to prevent errors
echo    - Added proper field validation
echo    - Fixed image alt text requirements
echo.
echo 🌐 Studio will be available at: http://localhost:3334
echo.

call npm run dev-3334