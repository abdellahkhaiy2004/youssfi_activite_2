param(
    [switch]$StaticRoutes
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$java = (Get-Command java -CommandType Application).Source
$services = [ordered]@{
    'config-service' = 9999
    'discovery-service' = 8761
    'customer-service' = 8081
    'inventory-service' = 8082
    'billing-service' = 8083
    'gateway-service' = 8888
}
$processes = @{}
$logDirectory = Join-Path $root 'target/local-logs'

function Wait-ForService([string]$Name, [int]$Port) {
    $deadline = (Get-Date).AddSeconds(90)
    while ((Get-Date) -lt $deadline) {
        if ($processes[$Name].HasExited) {
            throw "$Name a quitté. Voir $logDirectory."
        }
        try {
            $health = Invoke-RestMethod "http://localhost:$Port/actuator/health" -TimeoutSec 2
            if ($health.status -eq 'UP') {
                Write-Host "$Name prêt sur le port $Port"
                return
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    throw "$Name indisponible sur le port $Port. Voir $logDirectory."
}

foreach ($name in $services.Keys) {
    $jar = "$name/target/$name-1.0.0.jar"
    if (-not (Test-Path -LiteralPath (Join-Path $root $jar) -PathType Leaf)) {
        throw "Fichier $jar manquant. Exécutez mvn clean verify à la racine."
    }
}

New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

try {
    foreach ($name in $services.Keys) {
        $javaArgs = @('-jar', "$name/target/$name-1.0.0.jar")
        if ($StaticRoutes -and $name -eq 'gateway-service') {
            $javaArgs += '--spring.profiles.active=static'
        }
        $processes[$name] = Start-Process -FilePath $java -ArgumentList $javaArgs -WorkingDirectory $root `
            -RedirectStandardOutput (Join-Path $logDirectory "$name.log") `
            -RedirectStandardError (Join-Path $logDirectory "$name.err.log") -PassThru -WindowStyle Hidden

        if ($name -in 'config-service', 'discovery-service') {
            Wait-ForService $name $services[$name]
        }
    }

    foreach ($name in $services.Keys | Select-Object -Skip 2) {
        Wait-ForService $name $services[$name]
    }

    Write-Host "Passerelle http://localhost:8888 | Journaux $logDirectory | Ctrl+C pour arrêter."
    while ($true) {
        foreach ($name in $processes.Keys) {
            if ($processes[$name].HasExited) {
                throw "$name a quitté. Voir $logDirectory."
            }
        }
        Start-Sleep -Seconds 1
    }
} finally {
    foreach ($process in $processes.Values) {
        if (-not $process.HasExited) {
            Stop-Process -InputObject $process
        }
    }
}
