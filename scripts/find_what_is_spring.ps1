$brainPath = 'C:\Users\MD SADIQUE AMIN\.gemini\antigravity-ide\brain\'
$transcripts = Get-ChildItem -Path $brainPath -Filter '*transcript*.jsonl' -Recurse -ErrorAction SilentlyContinue

foreach ($t in $transcripts) {
  $matches = Select-String -Path $t.FullName -Pattern "what-is-spring.mdx" -ErrorAction SilentlyContinue
  # We look for a line containing the write_to_file or long content of what-is-spring.mdx
  if ($matches) {
    # Let's check if the transcript has a large write call by filtering matches on line length
    foreach ($m in $matches) {
      if ($m.Line.Length > 20000) {
        Write-Output "Found large write call in transcript: $($t.FullName)"
        Write-Output "Line Number: $($m.LineNumber)"
        # Write this matching line to a temporary recovery file
        $m.Line | Out-File -FilePath "d:\current using file\8-26-2026\injoy&read&play\scripts\what-is-spring-raw.json" -Force
        exit
      }
    }
  }
}
