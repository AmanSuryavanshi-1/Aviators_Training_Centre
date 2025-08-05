@echo off
echo 🔍 Analytics System Check
echo ========================

echo.
echo 📊 Testing Real-time Analytics...
curl -s "http://localhost:3000/api/analytics/realtime?type=metrics" > temp_realtime.json
if %errorlevel% equ 0 (
    echo ✅ Real-time API responded
    type temp_realtime.json
) else (
    echo ❌ Real-time API failed
)

echo.
echo.
echo 📈 Testing Advanced Analytics...
curl -s "http://localhost:3000/api/analytics/advanced?type=events&start=2025-01-01T00:00:00.000Z&end=2025-12-31T23:59:59.999Z&validOnly=true" > temp_advanced.json
if %errorlevel% equ 0 (
    echo ✅ Advanced Analytics API responded
    type temp_advanced.json
) else (
    echo ❌ Advanced Analytics API failed
)

echo.
echo.
echo 📝 Testing Analytics Tracking...
echo {"sessionId":"test-123","event":{"type":"page_view","page":"/test"},"source":{"source":"test","category":"verification"}} > temp_track_data.json
curl -s -X POST -H "Content-Type: application/json" -d @temp_track_data.json "http://localhost:3000/api/analytics/track" > temp_track_result.json
if %errorlevel% equ 0 (
    echo ✅ Analytics Tracking API responded
    type temp_track_result.json
) else (
    echo ❌ Analytics Tracking API failed
)

echo.
echo.
echo 🏥 Testing Health Check...
curl -s "http://localhost:3000/api/health" > temp_health.json
if %errorlevel% equ 0 (
    echo ✅ Health Check API responded
    type temp_health.json
) else (
    echo ❌ Health Check API failed
)

echo.
echo.
echo 🧹 Cleaning up temporary files...
del temp_*.json 2>nul

echo.
echo ✅ Analytics check complete!
echo.
echo 📋 To verify data quality:
echo 1. Check if "fallback": true appears in real-time response (bad)
echo 2. Check if tracking returns "success": true (good)
echo 3. Check if advanced analytics returns actual events (good)
echo.
pause