Write-Host "Starting FlowDownloader Desktop Application..." -ForegroundColor Green
Write-Host ""
Write-Host "Prerequisites Check:" -ForegroundColor Yellow
Write-Host "- Backend server should be running on http://localhost:3001" -ForegroundColor Cyan
Write-Host "- Web server should be running on http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Launching Electron app..." -ForegroundColor Green
npm start