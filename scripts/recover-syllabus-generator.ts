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

function recoverSyllabusGenerator() {
  const logs = walkLogs(brainPath);
  console.log(`Scanning ${logs.length} log files across all conversations for syllabusGenerator.ts ...`);

  let maxLen = 0;
  let maxContent = '';
  let maxLogFile = '';
  let maxStep = -1;

  for (let logFile of logs) {
    const content = fs.readFileSync(logFile, 'utf8');
    if (!content.includes('syllabusGenerator.ts') || !content.includes('SYLLABUS_MAP')) {
      continue;
    }

    const lines = content.split('\n');
    for (let line of lines) {
      if (line.includes('syllabusGenerator.ts') && line.includes('SYLLABUS_MAP') && line.includes('spring-framework-fundamentals')) {
        // We look for writes or views that contain the original spring topics
        let candidate = '';
        let stepIndex = -1;

        try {
          const step = JSON.parse(line);
          stepIndex = step.step_index;
          
          // Check if it's in tool calls (write_to_file)
          if (step.tool_calls) {
            for (let tc of step.tool_calls) {
              if (tc.args && tc.args.CodeContent) {
                candidate = tc.args.CodeContent;
              }
            }
          }
          // Or if it's in a view_file response
          if (!candidate && step.content) {
            candidate = step.content;
          }
        } catch (e) {
          // Try regex parsing if JSON.parse fails
          const codeMarker = '"CodeContent":"';
          const startIndex = line.indexOf(codeMarker);
          if (startIndex !== -1) {
            const codeStart = startIndex + codeMarker.length;
            let codeEnd = -1;
            const markers = ['","Description"', '","Overwrite"', '","toolAction"'];
            for (let m of markers) {
              const idx = line.indexOf(m, codeStart);
              if (idx !== -1 && (codeEnd === -1 || idx < codeEnd)) {
                codeEnd = idx;
              }
            }
            if (codeEnd !== -1) {
              try {
                candidate = JSON.parse('"' + line.substring(codeStart, codeEnd) + '"');
              } catch (err) {}
            }
          }
        }

        if (candidate && candidate.includes('spring-framework-fundamentals') && candidate.includes('what-is-spring')) {
          // Ensure it's the full original file by checking for keys or length
          if (candidate.length > maxLen) {
            maxLen = candidate.length;
            maxContent = candidate;
            maxLogFile = logFile;
            maxStep = stepIndex;
          }
        }
      }
    }
  }

  if (maxContent) {
    // If it was a VIEW_FILE response, it might have line prefixes (e.g. "1: ...") or truncated lines.
    // Let's make sure we clean it up if it came from VIEW_FILE.
    let cleaned = maxContent;
    if (cleaned.includes('Showing lines') || /^\d+:\s/m.test(cleaned)) {
      // Clean lines matching "1: some code"
      const lines = cleaned.split('\n');
      const cleanLines = lines.map(line => {
        const match = line.match(/^\d+:\s*(.*)/);
        return match ? match[1] : line;
      }).filter(line => !line.includes('Showing lines') && !line.includes('File Path:') && !line.includes('Total Lines:'));
      cleaned = cleanLines.join('\n');
    }

    const targetPath = 'd:/current using file/8-26-2026/injoy&read&play/src/lib/syllabusGenerator.ts';
    fs.writeFileSync(targetPath, cleaned, 'utf8');
    console.log(`🎉 SUCCESS: Recovered syllabusGenerator.ts from ${path.basename(maxLogFile)} Step ${maxStep}! Size: ${cleaned.length} chars`);
  } else {
    console.error("Could not find any original syllabusGenerator.ts content in the logs.");
  }
}

recoverSyllabusGenerator();
