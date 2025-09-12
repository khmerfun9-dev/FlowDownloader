# FlowDownloader Vercel Deployment Script
# PowerShell version for enhanced compatibility

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FlowDownloader Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Step 1: Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js and npm are available" -ForegroundColor Green

# Step 2: Install Vercel CLI
Write-Host "[2/6] Installing Vercel CLI..." -ForegroundColor Yellow

try {
    npm install -g vercel@latest
    Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install Vercel CLI" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Navigate to web directory
Write-Host "[3/6] Preparing web application..." -ForegroundColor Yellow

if (-not (Test-Path "web")) {
    Write-Host "ERROR: web directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the FlowDownloader root directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location "web"

# Step 4: Install dependencies
Write-Host "[4/6] Installing dependencies..." -ForegroundColor Yellow

try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 5: Build the application
Write-Host "[5/6] Building the application..." -ForegroundColor Yellow

try {
    npm run build
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 6: Deploy to Vercel
Write-Host "[6/6] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Please complete the login process in your browser if prompted" -ForegroundColor Cyan

try {
    # First login (if not already logged in)
    vercel login
    
    # Deploy to production
    vercel --prod
    
    Write-Host "" 
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your FlowDownloader app is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure your custom domain in Vercel dashboard" -ForegroundColor White
    Write-Host "2. Set up environment variables for production" -ForegroundColor White
    Write-Host "3. Test all functionality on the live site" -ForegroundColor White
    Write-Host ""
    Write-Host "Visit https://vercel.com/dashboard to manage your deployment" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Return to original directory
Set-Location ".."

Read-Host "Press Enter to exit"