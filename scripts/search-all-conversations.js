const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\MD SADIQUE AMIN\\.gemini\\antigravity-ide\\brain\\';

function walkLogs(dir) {
  let results = [];
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

const logs = walkLogs(brainPath);
console.log(`Scanning ${logs.length} log files across all conversations...`);

logs.forEach(logFile => {
  const content = fs.readFileSync(logFile, 'utf8');
  if (!content.includes('what-is-spring.mdx') || !content.includes('write_to_file')) {
    return;
  }

  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.includes('write_to_file') && line.includes('what-is-spring.mdx')) {
      const codeMarker = '"CodeContent":"';
      const startIndex = line.indexOf(codeMarker);
      if (startIndex === -1) return;

      const codeStart = startIndex + codeMarker.length;
      
      let codeEnd = -1;
      const markers = ['\",\"Description\"', '\",\"Overwrite\"', '\",\"toolAction\"'];
      for (let m of markers) {
        const idx = line.indexOf(m, codeStart);
        if (idx !== -1 && (codeEnd === -1 || idx < codeEnd)) {
          codeEnd = idx;
        }
      }

      if (codeEnd === -1) return;

      let rawCode = line.substring(codeStart, codeEnd);
      
      try {
        const cleanContent = JSON.parse('"' + rawCode + '"');
        let stepIndex = -1;
        try {
          const step = JSON.parse(line);
          stepIndex = step.step_index;
        } catch(e) {}

        console.log(`File: ${path.relative(brainPath, logFile)} | Step ${stepIndex} | Size: ${cleanContent.length} chars`);
        console.log(cleanContent.substring(0, 300).replace(/\n/g, ' '));
        console.log('='.repeat(80));
      } catch (e) {
        // Ignore unescape errors
      }
    }
  });
});
