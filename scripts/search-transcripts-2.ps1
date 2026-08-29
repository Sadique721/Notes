$brainPath = 'C:\Users\MD SADIQUE AMIN\.gemini\antigravity-ide\brain\'
$transcripts = Get-ChildItem -Path $brainPath -Filter '*transcript*.jsonl' -Recurse -ErrorAction SilentlyContinue

foreach ($t in $transcripts) {
  $matches = Select-String -Path $t.FullName -Pattern "Java's Exception Handling mechanism" -ErrorAction SilentlyContinue
  if ($matches) {
    Write-Output "Found in transcript: $($t.FullName)"
    Write-Output "Line: $($matches[0].LineNumber)"
    # Output the matching line content
    Write-Output "$($matches[0].Line)"
    break
  }
}
