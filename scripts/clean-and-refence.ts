import * as fs from 'fs';
import * as path from 'path';

const contentRoot = path.join(__dirname, '../content');

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.mdx')) {
      results.push(fullPath);
    }
  });
  return results;
}

// Check if a line is a plain code fence (no language tag)
function isPlainFence(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '```';
}

function cleanAndRefenceFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const totalLines = lines.length;

  // 1. Strip all plain fences
  const cleanLines: string[] = [];
  for (let i = 0; i < totalLines; i++) {
    if (!isPlainFence(lines[i])) {
      cleanLines.push(lines[i]);
    }
  }

  // Save intermediate clean content
  const cleanContent = cleanLines.join('\n');
  fs.writeFileSync(filePath, cleanContent, 'utf8');
}

// The core fencing algorithm
function autoFenceFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const totalLines = lines.length;

  // Find frontmatter end index
  let fmEndIndex = -1;
  let dashesCount = 0;
  for (let i = 0; i < totalLines; i++) {
    if (lines[i].trim() === '---') {
      dashesCount++;
      if (dashesCount === 2) {
        fmEndIndex = i;
        break;
      }
    }
  }

  if (fmEndIndex === -1) return;

  const fmLines = lines.slice(0, fmEndIndex + 1);
  const bodyLines = lines.slice(fmEndIndex + 1);
  const totalBodyLines = bodyLines.length;

  // Track code block states (only count language-specific blocks like ```java since we stripped plain ones)
  const inCodeBlock = new Array(totalBodyLines).fill(false);
  let inside = false;
  for (let i = 0; i < totalBodyLines; i++) {
    const trimmed = bodyLines[i].trim();
    if (trimmed.startsWith('```') && trimmed !== '```') {
      inside = !inside;
      inCodeBlock[i] = true;
    } else if (trimmed === '```' && inside) {
      // If we hit a closing fence for a language block
      inside = false;
      inCodeBlock[i] = true;
    } else {
      inCodeBlock[i] = inside;
    }
  }

  const processed = new Set<number>();
  let modified = false;

  for (let i = 0; i < totalBodyLines; i++) {
    if (inCodeBlock[i] || processed.has(i)) continue;

    const currentLine = bodyLines[i].trim();
    
    // Match line containing diagram operators
    if (/[↓→├└]/.test(currentLine)) {
      let start = i;
      while (start > 0) {
        const prevIdx = start - 1;
        if (inCodeBlock[prevIdx]) break;
        const prevLine = bodyLines[prevIdx].trim();
        if (prevLine.startsWith('```') || prevLine.startsWith('##') || prevLine.startsWith('#') || prevLine.length > 80) {
          break;
        }
        if (prevLine.length === 0 && start < i && bodyLines[start].trim().length === 0) {
          break;
        }
        start = prevIdx;
      }

      let end = i;
      while (end < totalBodyLines - 1) {
        const nextIdx = end + 1;
        if (inCodeBlock[nextIdx]) break;
        const nextLine = bodyLines[nextIdx].trim();
        if (nextLine.startsWith('```') || nextLine.startsWith('##') || nextLine.startsWith('#') || nextLine.length > 80) {
          break;
        }
        if (nextLine.length === 0 && end > i && bodyLines[end].trim().length === 0) {
          break;
        }
        end = nextIdx;
      }

      const blockLines: string[] = [];
      let hasGlyphs = false;
      for (let idx = start; idx <= end; idx++) {
        processed.add(idx);
        const l = bodyLines[idx].trim();
        if (l.length > 0) {
          blockLines.push(l);
          if (/[↓→├└│]/.test(l)) {
            hasGlyphs = true;
          }
        }
      }

      if (hasGlyphs && blockLines.length >= 2) {
        const fencedBlock = `\n\`\`\`\n${blockLines.join('\n')}\n\`\`\`\n`;
        bodyLines[start] = fencedBlock;
        for (let idx = start + 1; idx <= end; idx++) {
          bodyLines[idx] = '';
        }
        modified = true;
      }
    }
  }

  if (modified) {
    const cleanBodyLines = bodyLines.filter((l, idx) => l !== '' || (idx > 0 && bodyLines[idx - 1] !== ''));
    const cleanContent = [...fmLines, ...cleanBodyLines].join('\n');
    fs.writeFileSync(filePath, cleanContent, 'utf8');
    console.log(`  Cleaned & refenced: ${path.basename(filePath)}`);
  }
}

function main() {
  console.log('--- CLEANING AND REFENCING DIAGRAMS ---');
  const files = walk(contentRoot);
  // Clean all files first to remove broken fences
  files.forEach(f => cleanAndRefenceFile(f));
  // Re-fence all diagram sections
  files.forEach(f => autoFenceFile(f));
  console.log('--- COMPLETE ---');
}

main();
