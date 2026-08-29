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

function recoverWhatIsSpring() {
  const logs = walkLogs(brainPath);
  console.log(`Scanning ${logs.length} log files...`);

  for (let logFile of logs) {
    // Read line by line or scan the raw content to see if it references what-is-spring.mdx
    const content = fs.readFileSync(logFile, 'utf8');
    if (content.includes('what-is-spring.mdx')) {
      // Find lines that look like a write_to_file call
      const lines = content.split('\n');
      for (let line of lines) {
        if (line.includes('write_to_file') && line.includes('what-is-spring.mdx')) {
          try {
            const step = JSON.parse(line);
            if (step.tool_calls) {
              for (let tc of step.tool_calls) {
                if (tc.name === 'write_to_file' && tc.args.TargetFile.includes('what-is-spring.mdx')) {
                  let codeContent = tc.args.CodeContent;
                  if (codeContent) {
                    if (codeContent.startsWith('"') && codeContent.endsWith('"')) {
                      try {
                        codeContent = JSON.parse(codeContent);
                      } catch (e) {
                        codeContent = codeContent.substring(1, codeContent.length - 1);
                      }
                    }
                    const targetFile = 'd:/current using file/8-26-2026/injoy&read&play/content/spring-framework-fundamentals/what-is-spring.mdx';
                    fs.writeFileSync(targetFile, codeContent, 'utf8');
                    console.log(`🎉 SUCCESS: Recovered what-is-spring.mdx from ${path.basename(logFile)}!`);
                    return;
                  }
                }
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }
  console.log('Finished search.');
}

recoverWhatIsSpring();
