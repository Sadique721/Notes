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

function recoverMaxAcrossAllLogs() {
  const logs = walkLogs(brainPath);
  console.log(`Scanning ${logs.length} log files across all conversations...`);

  let maxLen = 0;
  let maxContent = '';
  let maxLogFile = '';
  let maxStep = -1;

  for (let logFile of logs) {
    const content = fs.readFileSync(logFile, 'utf8');
    if (!content.includes('what-is-spring.mdx') || !content.includes('write_to_file')) {
      continue;
    }

    const lines = content.split('\n');
    for (let line of lines) {
      if (line.includes('write_to_file') && line.includes('what-is-spring.mdx')) {
        const codeMarker = '"CodeContent":"';
        const startIndex = line.indexOf(codeMarker);
        if (startIndex === -1) continue;

        const codeStart = startIndex + codeMarker.length;
        
        let codeEnd = -1;
        const markers = ['","Description"', '","Overwrite"', '","toolAction"'];
        for (let m of markers) {
          const idx = line.indexOf(m, codeStart);
          if (idx !== -1 && (codeEnd === -1 || idx < codeEnd)) {
            codeEnd = idx;
          }
        }

        if (codeEnd === -1) continue;

        let rawCode = line.substring(codeStart, codeEnd);
        
        try {
          const cleanContent = JSON.parse('"' + rawCode + '"');
          let stepIndex = -1;
          try {
            const step = JSON.parse(line);
            stepIndex = step.step_index;
          } catch(e) {}

          console.log(`Found candidate in ${path.basename(logFile)} | Step ${stepIndex} | Length: ${cleanContent.length} chars`);
          if (cleanContent.length > maxLen) {
            maxLen = cleanContent.length;
            maxContent = cleanContent;
            maxLogFile = logFile;
            maxStep = stepIndex;
          }
        } catch (e) {
          // Ignore unescape errors
        }
      }
    }
  }

  if (maxContent) {
    const targetPath = 'd:/current using file/8-26-2026/injoy&read&play/content/spring-framework-fundamentals/what-is-spring.mdx';
    fs.writeFileSync(targetPath, maxContent, 'utf8');
    console.log(`🎉 SUCCESS: Recovered what-is-spring.mdx from ${path.basename(maxLogFile)} Step ${maxStep}! Size: ${maxLen} chars`);
  } else {
    console.error("No valid content found to recover.");
  }
}

recoverMaxAcrossAllLogs();
