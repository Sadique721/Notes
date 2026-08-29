Get-ChildItem -Path 'C:\Users\MD SADIQUE AMIN\.gemini\antigravity-ide\brain\' -Filter '*transcript*.jsonl' -Recurse -ErrorAction SilentlyContinue | 
    Select-String -Pattern 'generate_image' | 
    Group-Object { $_.Path } | 
    Select-Object Name
