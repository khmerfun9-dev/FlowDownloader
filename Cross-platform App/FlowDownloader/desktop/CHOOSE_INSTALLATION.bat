@echo off
color 0A
title FlowDownloader Desktop v1.0.1 - Installation Options
cls

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║              FlowDownloader Desktop v1.0.1                   ║
echo  ║                 Installation Options                         ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  Available Installation Methods:
echo.
echo  [1] Setup Installer (Recommended)
echo      File: FlowDownloader Setup 1.0.1.exe
echo      - Full installation with shortcuts
echo      - Start menu integration
echo      - Automatic uninstaller
echo.
echo  [2] Portable Executable
echo      File: FlowDownloader 1.0.1.exe
echo      - No installation required
echo      - Run from anywhere
echo      - Perfect for USB drives
echo.
echo  [3] ZIP Archive
echo      File: FlowDownloader-1.0.1-win.zip
echo      - Extract and run
echo      - Smallest download size
echo      - Manual setup control
echo.
echo  [4] Development Build
echo      Folder: win-unpacked\FlowDownloader.exe
echo      - Direct executable access
echo      - Fastest startup
echo      - All files visible
echo.
echo  [5] Launch Current Installation
echo      - Start existing desktop app
echo      - Requires backend and web servers
echo.
echo  [6] View Installation Guide
echo      - Open detailed documentation
echo.
echo  [7] Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo.
    echo Starting Setup Installer...
    if exist "dist\FlowDownloader Setup 1.0.1.exe" (
        start "" "dist\FlowDownloader Setup 1.0.1.exe"
    ) else (
        echo Error: Setup installer not found!
        echo Please ensure the dist folder contains the installer.
    )
    goto end
)

if "%choice%"=="2" (
    echo.
    echo Starting Portable Executable...
    if exist "dist\FlowDownloader 1.0.1.exe" (
        start "" "dist\FlowDownloader 1.0.1.exe"
    ) else (
        echo Error: Portable executable not found!
        echo Please check the dist folder.
    )
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Opening ZIP Archive location...
    if exist "dist\FlowDownloader-1.0.1-win.zip" (
        explorer /select,"dist\FlowDownloader-1.0.1-win.zip"
        echo.
        echo Extract the ZIP file and run FlowDownloader.exe inside.
    ) else (
        echo Error: ZIP archive not found!
    )
    goto end
)

if "%choice%"=="4" (
    echo.
    echo Starting Development Build...
    if exist "dist\win-unpacked\FlowDownloader.exe" (
        start "" "dist\win-unpacked\FlowDownloader.exe"
    ) else (
        echo Error: Development build not found!
        echo Please run 'npm run build:dir' first.
    )
    goto end
)

if "%choice%"=="5" (
    echo.
    echo Launching FlowDownloader Desktop...
    echo.
    echo Checking prerequisites...
    echo - Backend server should be running on http://localhost:3001
    echo - Web server should be running on http://localhost:5173
    echo.
    pause
    npm start
    goto end
)

if "%choice%"=="6" (
    echo.
    echo Opening Installation Guide...
    if exist "INSTALLATION_PACKAGE_v1.0.1.md" (
        start "" "INSTALLATION_PACKAGE_v1.0.1.md"
    ) else (
        echo Error: Installation guide not found!
    )
    if exist "DESKTOP_INSTALLATION_GUIDE.md" (
        start "" "DESKTOP_INSTALLATION_GUIDE.md"
    )
    goto end
)

if "%choice%"=="7" (
    echo.
    echo Thank you for using FlowDownloader Desktop!
    goto end
)

echo.
echo Invalid choice. Please enter a number between 1-7.
pause
goto start

:end
echo.
echo Press any key to exit...
pause >nul