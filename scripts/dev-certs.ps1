# Generates a self-signed development certificate used only by the local dev servers
# so a phone on the same Wi-Fi can use the microphone. Phones treat plain http:// LAN
# pages as insecure, which blocks getUserMedia; HTTPS makes the page a secure context.
# Dev only - never use these certs in production.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$certsDir = Join-Path $root "certs"
New-Item -ItemType Directory -Force -Path $certsDir | Out-Null

$key = Join-Path $certsDir "dev-key.pem"
$cert = Join-Path $certsDir "dev-cert.pem"

try {
  $ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object -ExpandProperty IPAddress
} catch {
    $ips = @()
}

$san = "DNS:localhost,IP:127.0.0.1,IP:::1"
foreach ($ip in $ips) {
    $san += ",IP:$ip"
}

& openssl req -x509 -newkey rsa:2048 -sha256 -nodes -days 365 `
    -keyout $key -out $cert -subj "/CN=localhost" `
    -addext "subjectAltName=$san" `
    -addext "extendedKeyUsage=serverAuth"

if (-not $?) { throw "openssl failed" }

Write-Host ""
Write-Host "Dev certificate written: $certsDir"
Write-Host "  key : $key"
Write-Host "  cert: $cert"
Write-Host "  SAN : $san"
Write-Host ""
Write-Host "Start the dev servers with HTTPS:"
Write-Host "  backend : uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile ../certs/dev-key.pem --ssl-certfile ../certs/dev-cert.pem"
Write-Host "  frontend: npm run dev:https"
Write-Host ""
Write-Host "Open https://localhost:3000 on the laptop and https://$($ips[0]):3000 on the phone"
Write-Host "(accept the self-signed certificate warning once on each device)."