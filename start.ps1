#!/usr/bin/env pwsh
# Starts the Spring Boot backend on :8080 and the Next.js frontend on :3000.
# Usage:  .\start.ps1

$ErrorActionPreference = 'Stop'

$RootDir     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir  = Join-Path $RootDir 'backend'
$FrontendDir = Join-Path $RootDir 'frontend'

function Stop-PortOwners {
    param([int]$Port)
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) { return }
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -and $_ -ne 0 }
    foreach ($processId in $pids) {
        $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
        $name = if ($proc) { $proc.ProcessName } else { 'unknown' }
        Write-Host "  port ${Port}: killing $name (PID $processId)" -ForegroundColor Yellow
        try { Stop-Process -Id $processId -Force -ErrorAction Stop } catch {
            Write-Host "    failed to stop PID ${processId}: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Pre-flight: free required ports so the child processes don't die on startup.
Write-Host 'Freeing ports 8080 and 3000 if in use...' -ForegroundColor Cyan
foreach ($p in 8080, 3000) { Stop-PortOwners -Port $p }
Start-Sleep -Milliseconds 500  # give the OS a moment to release the sockets

# Pre-flight: backend needs a JDK 17+ (javac). Auto-discover one if JAVA_HOME
# is unset or points at a JRE, so we don't depend on the global environment.
function Find-Jdk17Home {
    # 1. Honor existing JAVA_HOME if it has javac.
    if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME 'bin\javac.exe'))) {
        return $env:JAVA_HOME
    }
    # 2. Honor javac already on PATH.
    $javac = Get-Command 'javac' -ErrorAction SilentlyContinue
    if ($javac) { return (Split-Path -Parent (Split-Path -Parent $javac.Source)) }
    # 3. Search common install roots for any jdk-17*/jdk-21* directory.
    $roots = @(
        (Join-Path $env:LOCALAPPDATA 'Programs'),
        'C:\Program Files\Eclipse Adoptium',
        'C:\Program Files\Microsoft',
        'C:\Program Files\Java',
        'C:\Program Files\Zulu',
        'C:\Program Files\Amazon Corretto'
    )
    foreach ($root in $roots) {
        if (-not (Test-Path $root)) { continue }
        $candidate = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '^(jdk-?)?(17|21)' -and (Test-Path (Join-Path $_.FullName 'bin\javac.exe')) } |
            Select-Object -First 1
        if ($candidate) { return $candidate.FullName }
    }
    return $null
}

$jdkHome = Find-Jdk17Home
if (-not $jdkHome) {
    Write-Host 'ERROR: no JDK 17+ found. Backend will not compile.' -ForegroundColor Red
    Write-Host 'Install one (e.g. extract the Temurin 17 zip from api.adoptium.net) and retry.' -ForegroundColor Yellow
    exit 1
}
Write-Host "Using JDK: $jdkHome" -ForegroundColor Cyan
$env:JAVA_HOME = $jdkHome
$env:PATH = (Join-Path $jdkHome 'bin') + ';' + $env:PATH

if (Test-Path (Join-Path $BackendDir 'mvnw.cmd')) {
    $MvnCmd = Join-Path $BackendDir 'mvnw.cmd'
} else {
    $MvnCmd = 'mvn'
}

Write-Host 'Starting backend on port 8080...' -ForegroundColor Cyan
$backend = Start-Process -FilePath $MvnCmd `
    -ArgumentList 'spring-boot:run', '-Dspring-boot.run.arguments=--server.port=8080' `
    -WorkingDirectory $BackendDir `
    -NoNewWindow -PassThru

Write-Host 'Starting frontend on port 3000...' -ForegroundColor Cyan
$env:PORT = '3000'
$frontend = Start-Process -FilePath 'npm.cmd' `
    -ArgumentList 'run', 'dev', '--', '--port', '3000' `
    -WorkingDirectory $FrontendDir `
    -NoNewWindow -PassThru

Write-Host ''
Write-Host "Backend  PID: $($backend.Id)  (http://localhost:8080)" -ForegroundColor Green
Write-Host "Frontend PID: $($frontend.Id)  (http://localhost:3000)" -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop both.' -ForegroundColor Yellow

try {
    while (-not $backend.HasExited -and -not $frontend.HasExited) {
        Start-Sleep -Seconds 1
    }
    # Report which side died first so the survivor's shutdown isn't mysterious.
    if ($backend.HasExited) {
        Write-Host "Backend exited (code $($backend.ExitCode)). Stopping frontend." -ForegroundColor Yellow
    } else {
        Write-Host "Frontend exited (code $($frontend.ExitCode)). Stopping backend." -ForegroundColor Yellow
    }
}
finally {
    Write-Host 'Shutting down...' -ForegroundColor Yellow
    foreach ($proc in @($backend, $frontend)) {
        if ($proc -and -not $proc.HasExited) {
            try { Stop-Process -Id $proc.Id -Force -ErrorAction Stop } catch {}
        }
    }
}
