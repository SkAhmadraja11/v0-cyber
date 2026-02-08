# Create a clean zip for the Chrome Web Store

$source = "c:\cyber-phishing\v0-cyber\extension"
$destination = "c:\cyber-phishing\v0-cyber\phishing-detective-v2.1.zip"
$tempDir = "$env:TEMP\phishing-extension-temp"

# Cleanup previous
if (Test-Path $destination) { Remove-Item $destination }
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

# Create Temp Directory
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy only necessary files
$filesToCopy = @(
    "manifest.json",
    "background.js",
    "content_gmail.js",
    "sidepanel.html",
    "sidepanel.js",
    "styles.css",
    "icon.png"
)

foreach ($file in $filesToCopy) {
    Copy-Item "$source\$file" "$tempDir\$file"
}

# Zip it
Compress-Archive -Path "$tempDir\*" -DestinationPath $destination

# Cleanup Temp
Remove-Item $tempDir -Recurse -Force

Write-Host "Extension successfully zipped to: $destination"
