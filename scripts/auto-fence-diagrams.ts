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

function autoFenceFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const totalLines = lines.length;

  // Find frontmatter end index (the second '---' line)
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

  if (fmEndIndex === -1) {
    // If no frontmatter is found, do not process
    return;
  }

  const fmLines = lines.slice(0, fmEndIndex + 1);
  const bodyLines = lines.slice(fmEndIndex + 1);
  const totalBodyLines = bodyLines.length;

  // Track code block states inside body lines only
  const inCodeBlock = new Array(totalBodyLines).fill(false);
  let inside = false;
  for (let i = 0; i < totalBodyLines; i++) {
    if (bodyLines[i].trim().startsWith('```')) {
      inside = !inside;
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
      // Find start of block (walk up)
      let start = i;
      while (start > 0) {
        const prevIdx = start - 1;
        if (inCodeBlock[prevIdx]) break;
        const prevLine = bodyLines[prevIdx].trim();
        // Stop indicators
        if (prevLine.startsWith('```') || prevLine.startsWith('##') || prevLine.startsWith('#') || prevLine.length > 80) {
          break;
        }
        // Stop if we hit an empty line after another empty line
        if (prevLine.length === 0 && start < i && bodyLines[start].trim().length === 0) {
          break;
        }
        start = prevIdx;
      }

      // Find end of block (walk down)
      let end = i;
      while (end < totalBodyLines - 1) {
        const nextIdx = end + 1;
        if (inCodeBlock[nextIdx]) break;
        const nextLine = bodyLines[nextIdx].trim();
        // Stop indicators
        if (nextLine.startsWith('```') || nextLine.startsWith('##') || nextLine.startsWith('#') || nextLine.length > 80) {
          break;
        }
        // Stop on consecutive empty lines
        if (nextLine.length === 0 && end > i && bodyLines[end].trim().length === 0) {
          break;
        }
        end = nextIdx;
      }

      // Extract lines in range, trim them
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

      // Ensure block contains a valid diagram and minimum height
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
    console.log(`  Fenced diagrams in: ${path.basename(filePath)}`);
  }
}

function main() {
  console.log('--- AUTO-FENCING MDX DIAGRAMS (FM SAFE) ---');
  const files = walk(contentRoot);
  files.forEach(f => autoFenceFile(f));
  console.log('--- COMPLETE ---');
}

main();
