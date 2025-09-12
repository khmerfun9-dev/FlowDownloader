@echo off
echo FlowDownloader Deployment Script
echo ===================================

set /p choice="Choose deployment option (1=Web, 2=Desktop, 3=Both, 4=All): "

if "%choice%"=="1" goto web
if "%choice%"=="2" goto desktop
if "%choice%"=="3" goto both
if "%choice%"=="4" goto all
goto end

:web
echo Building web application...
cd web
call npm install
call npm run build
echo Web build complete! Check the 'dist' folder.
echo To deploy to Vercel:
echo 1. Visit https://vercel.com
echo 2. Sign up/login
echo 3. Import this project or upload the 'dist' folder
pause
goto end

:desktop
echo Building desktop application...
cd desktop
call npm install
echo Creating placeholder icons...
node create-icons.js
echo Building unsigned version...
call npm run build:unsigned
echo Desktop build complete! Check 'dist-test/win-unpacked/FlowDownloader.exe'
pause
goto end

:both
echo Building both web and desktop...
echo.
echo Building web application...
cd web
call npm install
call npm run build
cd ..
echo.
echo Building desktop application...
cd desktop
call npm install
node create-icons.js
call npm run build:unsigned
cd ..
echo.
echo Both builds complete!
echo Web: web/dist/
echo Desktop: desktop/dist-test/win-unpacked/FlowDownloader.exe
pause
goto end

:all
echo Building all components...
echo.
echo 1. Building backend...
cd backend
call npm install
echo Backend dependencies installed.
cd ..
echo.
echo 2. Building web application...
cd web
call npm install
call npm run build
cd ..
echo.
echo 3. Building desktop application...
cd desktop
call npm install
node create-icons.js
call npm run build:unsigned
cd ..
echo.
echo All builds complete!
echo Backend: Ready for deployment (see DEPLOYMENT_GUIDE.md)
echo Web: web/dist/
echo Desktop: desktop/dist-test/win-unpacked/FlowDownloader.exe
echo Mobile: See DEPLOYMENT_GUIDE.md for React Native setup
pause
goto end

:end
echo.
echo Deployment script finished.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
pause