Add-Type -AssemblyName System.Drawing
$src = $args[0]
$dest = $args[1]
if (Test-Path $src) {
    $img = [System.Drawing.Image]::FromFile($src)
    $img.Save($dest, [System.Drawing.Imaging.ImageFormat]::Gif)
    $img.Dispose()
    Write-Host "Converted $src to $dest"
} else {
    Write-Host "Source file not found: $src"
}
