[System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem')
$zip = [System.IO.Compression.ZipFile]::OpenRead('d:\current using file\8-26-2026\injoy&read&play.zip')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'injoy&read&play/content/spring-framework-fundamentals/what-is-spring.mdx' }
if ($entry) {
    Write-Output "File found: $($entry.FullName), Size: $($entry.Length) bytes"
} else {
    Write-Output "File not found in zip"
}
$zip.Dispose()
