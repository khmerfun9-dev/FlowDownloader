# FlowDownloader Deployment Script
# PowerShell version for cross-platform compatibility

Write-Host "FlowDownloader Deployment Script" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

Write-Host "Choose deployment option:" -ForegroundColor Yellow
Write-Host "1. Web App only"
Write-Host "2. Desktop App only"
Write-Host "3. Both Web and Desktop"
Write-Host "4. All components (Backend + Web + Desktop)"
Write-Host "5. Exit"

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Building web application..." -ForegroundColor Cyan
        Set-Location web
        npm install
        if ($LASTEXITCODE -eq 0) {
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Web build complete! Check the 'dist' folder." -ForegroundColor Green
                Write-Host "To deploy to Vercel:" -ForegroundColor Yellow
                Write-Host "1. Visit https://vercel.com"
                Write-Host "2. Sign up/login with GitHub"
                Write-Host "3. Import this project or upload the 'dist' folder"
            } else {
                Write-Host "Web build failed!" -ForegroundColor Red
            }
        } else {
            Write-Host "npm install failed!" -ForegroundColor Red
        }
        Set-Location ..
    }
    
    "2" {
        Write-Host "Building desktop application..." -ForegroundColor Cyan
        Set-Location desktop
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Creating placeholder icons..." -ForegroundColor Yellow
            node create-icons.js
            Write-Host "Building unsigned version..." -ForegroundColor Yellow
            npm run build:unsigned
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Desktop build complete!" -ForegroundColor Green
                Write-Host "Executable: dist-test/win-unpacked/FlowDownloader.exe" -ForegroundColor Green
            } else {
                Write-Host "Desktop build failed!" -ForegroundColor Red
            }
        } else {
            Write-Host "npm install failed!" -ForegroundColor Red
        }
        Set-Location ..
    }
    
    "3" {
        Write-Host "Building both web and desktop..." -ForegroundColor Cyan
        
        # Build web
        Write-Host "Building web application..." -ForegroundColor Yellow
        Set-Location web
        npm install
        npm run build
        Set-Location ..
        
        # Build desktop
        Write-Host "Building desktop application..." -ForegroundColor Yellow
        Set-Location desktop
        npm install
        node create-icons.js
        npm run build:unsigned
        Set-Location ..
        
        Write-Host "Both builds complete!" -ForegroundColor Green
        Write-Host "Web: web/dist/" -ForegroundColor Green
        Write-Host "Desktop: desktop/dist-test/win-unpacked/FlowDownloader.exe" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "Building all components..." -ForegroundColor Cyan
        
        # Backend
        Write-Host "1. Setting up backend..." -ForegroundColor Yellow
        Set-Location backend
        npm install
        Write-Host "Backend dependencies installed." -ForegroundColor Green
        Set-Location ..
        
        # Web
        Write-Host "2. Building web application..." -ForegroundColor Yellow
        Set-Location web
        npm install
        npm run build
        Set-Location ..
        
        # Desktop
        Write-Host "3. Building desktop application..." -ForegroundColor Yellow
        Set-Location desktop
        npm install
        node create-icons.js
        npm run build:unsigned
        Set-Location ..
        
        Write-Host "All builds complete!" -ForegroundColor Green
        Write-Host "Backend: Ready for deployment (see DEPLOYMENT_GUIDE.md)" -ForegroundColor Green
        Write-Host "Web: web/dist/" -ForegroundColor Green
        Write-Host "Desktop: desktop/dist-test/win-unpacked/FlowDownloader.exe" -ForegroundColor Green
        Write-Host "Mobile: See DEPLOYMENT_GUIDE.md for React Native setup" -ForegroundColor Yellow
    }
    
    "5" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
    
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Deployment script finished." -ForegroundColor Green
Write-Host "For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow

# Keep window open
Read-Host "Press Enter to exit"