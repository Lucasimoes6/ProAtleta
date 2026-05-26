# Mata backend (Java) e frontend (Node) que estao ocupando as portas 8080 e 5173.
# Uso: clique direito > "Executar com PowerShell"  (ou)  .\stop.ps1 no terminal

foreach ($port in 8080, 5173) {
    $pids = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
        Write-Host "Matando processo(s) na porta $port : $($pids -join ', ')" -ForegroundColor Yellow
        $pids | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction Stop } catch {} }
    } else {
        Write-Host "Porta $port ja esta livre." -ForegroundColor Gray
    }
}

Write-Host "Pronto." -ForegroundColor Green
