# Sobe backend (Spring Boot) e frontend (Vite) em janelas separadas,
# aguarda o backend ficar pronto e abre o navegador.
# Uso: clique direito > "Executar com PowerShell"  (ou)  .\run.ps1 no terminal

$root = $PSScriptRoot

Write-Host "==> Iniciando backend (porta 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$root\backend`"; mvn spring-boot:run"

Write-Host "==> Aguardando backend responder em http://localhost:8080 ..." -ForegroundColor Cyan
$deadline = (Get-Date).AddSeconds(90)
$ready = $false
while ((Get-Date) -lt $deadline) {
    $listen = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
    if ($listen) { $ready = $true; break }
    Start-Sleep -Seconds 2
}

if (-not $ready) {
    Write-Host "Backend nao subiu em 90s. Veja a janela do backend para detalhes." -ForegroundColor Yellow
} else {
    Write-Host "Backend pronto." -ForegroundColor Green
}

Write-Host "==> Iniciando frontend (porta 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$root\frontend`"; npm run dev"

Start-Sleep -Seconds 5
Write-Host "==> Abrindo navegador em http://localhost:5173" -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Tudo pronto. Para parar: feche as duas janelas pretas de PowerShell." -ForegroundColor Green
