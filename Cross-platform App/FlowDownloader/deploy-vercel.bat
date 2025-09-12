@echo off
echo ========================================
echo FlowDownloader Vercel Deployment Script
echo ========================================
echo.

echo [1/5] Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [2/5] Installing Vercel CLI...
npm install -g vercel@latest
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)

echo [3/5] Building the web application...
cd web
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo [4/5] Logging into Vercel...
echo Please complete the login process in your browser
vercel login

echo [5/5] Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Deployment completed successfully!
echo ========================================
echo.
echo Your FlowDownloader app is now live!
echo.
echo Next steps:
echo 1. Configure your custom domain in Vercel dashboard
echo 2. Set up environment variables for production
echo 3. Test all functionality on the live site
echo.
echo Visit https://vercel.com/dashboard to manage your deployment
echo.
pause