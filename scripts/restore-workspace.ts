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

const frontmatterKeys = [
  'title:',
  'slug:',
  'moduleSlug:',
  'order:',
  'summaryOneLiner:',
  'estimatedReadMinutes:',
  'generated:',
  'prerequisiteTopicSlugs:'
];

function fixFrontmatterInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const fmLines: string[] = [];
  const bodyLines: string[] = [];
  let foundKeysCount = 0;
  let inBody = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inBody) {
      bodyLines.push(line);
      continue;
    }

    // Check if line matches one of the frontmatter keys
    const isKey = frontmatterKeys.some(k => trimmed.startsWith(k));
    if (isKey) {
      fmLines.push(line);
      foundKeysCount++;
    } else if (trimmed === '---' || trimmed === '```') {
      // Skip these boundaries/fences in the frontmatter parsing phase
      continue;
    } else if (foundKeysCount > 0 && trimmed.length > 0) {
      // If we see actual content after finding some keys, and it doesn't match frontmatter keys, we have entered the body!
      inBody = true;
      bodyLines.push(line);
    }
  }

  // Reconstruct frontmatter and body
  const cleanFrontmatter = [
    '---',
    ...fmLines,
    '---'
  ].join('\n');

  const cleanBody = bodyLines.join('\n');
  const cleanContent = `${cleanFrontmatter}\n${cleanBody}`;

  fs.writeFileSync(filePath, cleanContent, 'utf8');
  console.log(`  Restored frontmatter in: ${path.basename(filePath)}`);
}

function main() {
  console.log('--- RESTORING FRONTMATTERS ---');
  const files = walk(contentRoot);
  files.forEach(f => fixFrontmatterInFile(f));
  console.log('--- COMPLETE ---');
}

main();
