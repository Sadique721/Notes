import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

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

// Re-import parseInterviewQAs logic for debugging
function debugParseQAs(content: string): any[] {
  const qas: any[] = [];
  let total = 0;
  const legacyRegex = /###\s+(\d+)\.\s+([\s\S]*?)\n\*\*Answer\*\*[:\s]+([\s\S]*?)(?=\n###\s+\d+\.|(?:\n#{1,2}\s)|$)/g;
  let m;
  while ((m = legacyRegex.exec(content)) !== null) {
    qas.push({ number: m[1], q: m[2] });
    total++;
  }
  if (qas.length > 0) return qas;

  const lines = content.split('\n');
  let currentQuestion = '';
  let currentAnswerLines: string[] = [];

  const commit = () => {
    if (currentQuestion && currentAnswerLines.length > 0) {
      qas.push({ q: currentQuestion });
      total++;
    }
    currentQuestion = '';
    currentAnswerLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const qMatch = line.match(/^(?:####\s+)?Q(\d+)\.\s*(.*)/i);
    if (qMatch) {
      commit();
      currentQuestion = qMatch[2].trim();
    } else if (currentQuestion) {
      if (line.startsWith('## ') || line.startsWith('# ') || line.startsWith('---')) {
        commit();
      } else {
        currentAnswerLines.push(line);
      }
    }
  }
  commit();
  return qas;
}

function main() {
  const files = walk(contentRoot);
  files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const q = debugParseQAs(content);
    console.log(`File: ${path.basename(f)} | QAs found: ${q.length}`);
  });
}

main();
