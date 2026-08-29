import * as fs from 'fs';
import * as path from 'path';

const logPath = 'C:\\Users\\MD SADIQUE AMIN\\.gemini\\antigravity-ide\\brain\\d5eba30a-931e-4751-931a-b50e6bb5b5fc\\.system_generated\\logs\\transcript_full.jsonl';

function recover() {
  if (!fs.existsSync(logPath)) {
    console.error("Log file not found at: " + logPath);
    return;
  }

  const logLines = fs.readFileSync(logPath, 'utf8').split('\n');
  let restoreCount = 0;

  for (let line of logLines) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      // Check if it's a model response with tool calls
      if (step.source === 'MODEL' && step.tool_calls) {
        for (let tc of step.tool_calls) {
          if (tc.name === 'write_to_file') {
            const args = tc.args;
            const targetFile = args.TargetFile;
            let codeContent = args.CodeContent;

            if (targetFile && targetFile.includes('content') && codeContent) {
              // Normalize clean target file path
              const cleanPath = targetFile.replace(/\\+/g, '/').replace(/"/g, '').trim();
              
              // Strip quotes from code content if any
              if (codeContent.startsWith('"') && codeContent.endsWith('"')) {
                // If it is doubly serialized inside the logs
                try {
                  codeContent = JSON.parse(codeContent);
                } catch (e) {
                  // Fallback: strip leading/trailing quotes
                  codeContent = codeContent.substring(1, codeContent.length - 1);
                }
              }

              // Ensure the folder exists
              const dir = path.dirname(cleanPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              fs.writeFileSync(cleanPath, codeContent, 'utf8');
              console.log(`  Recovered: ${path.basename(cleanPath)} -> ${cleanPath}`);
              restoreCount++;
            }
          }
        }
      }
    } catch (e) {
      // Skip invalid JSON lines
    }
  }

  console.log(`--- RECOVERY COMPLETED: Restored ${restoreCount} files ---`);
}

recover();
