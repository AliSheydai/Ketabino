# Require Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run PowerShell as Administrator to restart Docker automatically."
    Write-Warning "Attempting to just update the configuration..."
}

$dockerConfigDir = Join-Path $env:USERPROFILE ".docker"
$daemonJsonPath = Join-Path $dockerConfigDir "daemon.json"

# Create .docker folder if it doesn't exist
if (-not (Test-Path $dockerConfigDir)) {
    New-Item -ItemType Directory -Force -Path $dockerConfigDir | Out-Null
}

$mirrors = @(
    "https://docker.iranserver.com",
    "https://docker.arvancloud.ir",
    "https://docker.chabokan.net",
    "https://docker.parspack.ir"
)

# Read or create daemon.json
if (Test-Path $daemonJsonPath) {
    Write-Host "Found existing daemon.json, updating..."
    $content = Get-Content $daemonJsonPath -Raw
    if ([string]::IsNullOrWhiteSpace($content)) {
        $config = @{}
    } else {
        try {
            $config = $content | ConvertFrom-Json -AsHashtable
        } catch {
            Write-Warning "Existing daemon.json is invalid, overwriting..."
            $config = @{}
        }
    }
} else {
    Write-Host "Creating new daemon.json..."
    $config = @{}
}

# Update the registry-mirrors key
$config["registry-mirrors"] = $mirrors

# Save back to daemon.json
$config | ConvertTo-Json -Depth 10 | Set-Content $daemonJsonPath -Encoding UTF8
Write-Host "Mirrors successfully updated in $daemonJsonPath"

# Try to restart Docker Desktop if running
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcess) {
    Write-Host "Restarting Docker Desktop..."
    Stop-Process -Name "Docker Desktop" -Force
    Start-Sleep -Seconds 3
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Docker Desktop restarted! You can now run docker-compose build."
} else {
    Write-Host "Docker Desktop is not currently running. The mirrors will be active the next time you start it."
}

Write-Host "Press any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
