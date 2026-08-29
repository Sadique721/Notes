import * as fs from 'fs';
import * as path from 'path';

const brainPath = 'C:\\Users\\MD SADIQUE AMIN\\.gemini\\antigravity-ide\\brain\\';

function walkLogs(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkLogs(fullPath));
    } else if (file.endsWith('.jsonl')) {
      results.push(fullPath);
    }
  });
  return results;
}

function scanForWhatIsSpring() {
  const logs = walkLogs(brainPath);
  for (let logFile of logs) {
    const content = fs.readFileSync(logFile, 'utf8');
    if (content.includes('what-is-spring.mdx')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('what-is-spring.mdx')) {
          try {
            const step = JSON.parse(line);
            console.log(`Found reference in: ${path.basename(logFile)} | Step: ${step.step_index} | Source: ${step.source} | Type: ${step.type}`);
            if (step.tool_calls) {
              for (let tc of step.tool_calls) {
                console.log(`  Tool Call: ${tc.name}`);
              }
            }
          } catch (e) {
            // Ignore JSON errors
          }
        }
      }
    }
  }
}

scanForWhatIsSpring();
