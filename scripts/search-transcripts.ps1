# Search through all JSONL transcript files in the brain directory
$brainPath = 'C:\Users\MD SADIQUE AMIN\.gemini\antigravity-ide\brain\'
$transcripts = Get-ChildItem -Path $brainPath -Filter '*transcript*.jsonl' -Recurse -ErrorAction SilentlyContinue

foreach ($t in $transcripts) {
  # We look for lines containing a view_file output or write_file content for exception-handling.mdx
  # Let's search for "Exception Handling (Part 1)" or the specific title
  $matches = Select-String -Path $t.FullName -Pattern 'Exception Handling \\(Part 1\\)' -ErrorAction SilentlyContinue
  if ($matches) {
    Write-Output "Found matching transcript: $($t.FullName)"
    # Output the first match line number
    Write-Output "Match details: $($matches[0].LineNumber) : $($matches[0].Line)"
  }
}
