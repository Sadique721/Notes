import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Types import (relative)
import { ContentPart, DiagramSpec, InterviewQA, SearchEntry, GlossaryTerm } from '../src/types/content';
import { SYLLABUS_MAP, generateTopicContent } from '../src/lib/syllabusGenerator';

const contentRoot = path.join(__dirname, '../content');
const publicDir = path.join(__dirname, '../public');
const diagramsPublicDir = path.join(publicDir, 'diagrams');
const imagesSourceDir = path.join(__dirname, '../images');
const imagesDestDir = path.join(publicDir, 'illustrations/topics');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(diagramsPublicDir)) fs.mkdirSync(diagramsPublicDir, { recursive: true });
if (!fs.existsSync(imagesDestDir)) fs.mkdirSync(imagesDestDir, { recursive: true });

if (fs.existsSync(imagesSourceDir)) {
  const files = fs.readdirSync(imagesSourceDir);
  let topicImagesSynced = 0;
  let brandImagesSynced = 0;

  files.forEach(file => {
    const srcPath = path.join(imagesSourceDir, file);
    if (file.startsWith('injoy_read_play_')) {
      fs.copyFileSync(srcPath, path.join(publicDir, file));
      brandImagesSynced++;
    } else if (file.endsWith('.gif') || file.endsWith('.jpg')) {
      fs.copyFileSync(srcPath, path.join(imagesDestDir, file));
      topicImagesSynced++;
    }
  });
  console.log(`Synced ${topicImagesSynced} illustrations to public/illustrations/topics/`);
  console.log(`Synced ${brandImagesSynced} brand images to public/`);
}

console.log('--- RUNNING CODEVERSE CONTENT INDEX PIPELINE ---');

const searchIndex: SearchEntry[] = [];
const glossaryTerms: GlossaryTerm[] = [];
const contentManifest: Record<string, any> = {};
let totalQAs = 0;

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

// ── ASCII DIAGRAM PARSER ─────────────────────────────────────────────────────
function parseASCIIDiagram(text: string, id: string): DiagramSpec | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return null;

  const hasTreeGlyphs = /[├└]/.test(text);
  const hasArrows = /[↓→]/.test(text);
  if (!hasArrows && !hasTreeGlyphs) return null;

  const nodes: { id: string; label: string }[] = [];
  const edges: { from: string; to: string; animated?: boolean }[] = [];
  let lastNodeId = '';
  let kind: DiagramSpec['kind'] = hasTreeGlyphs ? 'tree' : 'flow';

  lines.forEach(line => {
    if (/^[↓→|▼─│]+$/.test(line)) return;
    const cleanedLabel = line.replace(/[│├└─┐┌▼↓→]/g, '').trim();
    if (!cleanedLabel || cleanedLabel.length < 2) return;

    const nodeId = cleanedLabel.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 40);

    if (!nodeId) return;
    if (!nodes.some(n => n.id === nodeId)) nodes.push({ id: nodeId, label: cleanedLabel });
    if (lastNodeId && lastNodeId !== nodeId && !edges.some(e => e.from === lastNodeId && e.to === nodeId)) {
      edges.push({ from: lastNodeId, to: nodeId, animated: true });
    }
    lastNodeId = nodeId;
  });

  if (nodes.length < 2) return null;
  return { id, kind, title: 'Process Flow', nodes, edges };
}

// ── QA PARSER ────────────────────────────────────────────────────────────────
function parseInterviewQAs(content: string, slug: string): InterviewQA[] {
  const qas: InterviewQA[] = [];
  const seen = new Set<number>();

  // Format 1: Legacy stub format (### N. ... \n**Question**: ... \n**Answer**: ...)
  const legacyRegex = /###\s+(\d+)\.\s+([\s\S]*?)\n\*\*Answer\*\*[:\s]+([\s\S]*?)(?=\n###\s+\d+\.|(?:\n#{1,2}\s)|$)/g;
  let m;
  while ((m = legacyRegex.exec(content)) !== null) {
    const num = parseInt(m[1], 10);
    if (seen.has(num)) continue;
    seen.add(num);
    const question = m[2].trim().replace(/\n/g, ' ');
    const answer = m[3].trim();
    if (!question || !answer) continue;
    const isFiveCrore = /5\s*crore|₹5/i.test(question + answer);
    qas.push({
      number: num,
      question,
      answer,
      isFiveCrore,
      difficulty: isFiveCrore ? 'five-crore' : (num % 7 === 0 ? 'hard' : 'medium'),
    });
    totalQAs++;
  }

  if (qas.length > 0) return qas;

  // Format 2: Standard/New format (Q1. Question \n\n Answer... or #### Q1. Question \n\n Answer...)
  const lines = content.split('\n');
  let currentQuestion = '';
  let currentAnswerLines: string[] = [];

  const commitCurrentQA = () => {
    if (currentQuestion && currentAnswerLines.length > 0) {
      const globalNum = totalQAs + 1;
      const answerText = currentAnswerLines.join('\n').trim();
      const isFiveCrore = /5\s*crore|₹5/i.test(currentQuestion + answerText);
      qas.push({
        number: globalNum,
        question: currentQuestion.trim(),
        answer: answerText,
        isFiveCrore,
        difficulty: isFiveCrore ? 'five-crore' : (globalNum % 7 === 0 ? 'hard' : 'medium'),
      });
      totalQAs++;
    }
    currentQuestion = '';
    currentAnswerLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const qMatch = line.match(/^(?:####\s+)?Q(\d+)\.\s*(.*)/i);
    if (qMatch) {
      commitCurrentQA();
      currentQuestion = qMatch[2].trim();
    } else if (currentQuestion) {
      if (line.startsWith('## ') || line.startsWith('# ') || line.startsWith('---')) {
        commitCurrentQA();
      } else {
        currentAnswerLines.push(line);
      }
    }
  }
  commitCurrentQA();

  return qas;
}

// ── PART PARSER ──────────────────────────────────────────────────────────────
function parseContentParts(content: string, topicQAs: InterviewQA[], slug: string, allDiagrams: DiagramSpec[]): any[] {
  const sections = content.split(/(?=^##\s+Part\s+\d+)/m).filter(s => s.trim().length > 0);

  if (sections.length <= 1) {
    const hookMatch = content.match(/Interview Question.*?₹5 Crore.*?\n([^\n]+)/i);
    const croreMatch = content.match(/₹5 Crore.*?Answer[:\n]\s*([\s\S]{1,500}?)(?=\n##|$)/i);
    
    // Parse diagrams for single section
    const partDiagrams: DiagramSpec[] = [];
    const codeFenceRegex = /```[\s\S]*?```/g;
    let fm;
    let localIdx = 0;
    while ((fm = codeFenceRegex.exec(content)) !== null) {
      const fc = fm[0].split('\n').slice(1, -1).join('\n');
      if (/[↓→]|[├└]/.test(fc)) {
        const spec = parseASCIIDiagram(fc, `${slug}-p1-d${localIdx}`);
        if (spec) {
          partDiagrams.push(spec);
          allDiagrams.push(spec);
        }
      }
      localIdx++;
    }

    return [{
      partNumber: 1,
      heading: 'Complete Content',
      interviewHook: hookMatch?.[1]?.trim(),
      fiveCroreAnswer: croreMatch?.[1]?.trim(),
      bodyMdx: content,
      diagramIds: partDiagrams.map(d => d.id),
      interviewQAs: topicQAs.map(qa => ({
        number: qa.number, question: qa.question, answer: qa.answer,
        isFiveCrore: qa.isFiveCrore, difficulty: qa.difficulty,
      })),
    }];
  }

  return sections.map((section, idx) => {
    const hm = section.match(/^##\s+Part\s+(\d+)[:\s]*(.*)/m);
    const partNum = hm ? parseInt(hm[1], 10) : idx + 1;
    const heading = hm ? hm[2].trim() : `Part ${partNum}`;
    const hookMatch = section.match(/Interview Question.*?₹5 Crore.*?\n([^\n]+)/i);
    const croreMatch = section.match(/₹5 Crore.*?Answer[:\n]\s*([\s\S]{1,500}?)(?=\n##|$)/i);
    const chunkSize = Math.max(1, Math.ceil(topicQAs.length / sections.length));
    const partQAs = topicQAs.slice(idx * chunkSize, (idx + 1) * chunkSize);

    // Parse diagrams for this section
    const partDiagrams: DiagramSpec[] = [];
    const codeFenceRegex = /```[\s\S]*?```/g;
    let fm;
    let localIdx = 0;
    while ((fm = codeFenceRegex.exec(section)) !== null) {
      const fc = fm[0].split('\n').slice(1, -1).join('\n');
      if (/[↓→]|[├└]/.test(fc)) {
        const spec = parseASCIIDiagram(fc, `${slug}-p${partNum}-d${localIdx}`);
        if (spec) {
          partDiagrams.push(spec);
          allDiagrams.push(spec);
        }
      }
      localIdx++;
    }

    return {
      partNumber: partNum,
      heading,
      interviewHook: hookMatch?.[1]?.trim(),
      fiveCroreAnswer: croreMatch?.[1]?.trim(),
      bodyMdx: section,
      diagramIds: partDiagrams.map(d => d.id),
      interviewQAs: partQAs.map(qa => ({
        number: qa.number, question: qa.question, answer: qa.answer,
        isFiveCrore: qa.isFiveCrore, difficulty: qa.difficulty,
      })),
    };
  });
}

// ── MAIN LOOP ────────────────────────────────────────────────────────────────
const mdxFiles = walk(contentRoot);
console.log(`Found ${mdxFiles.length} MDX files to process.`);

// Map of slug -> filePath
const mdxFilesMap = new Map<string, string>();
mdxFiles.forEach(filePath => {
  const slug = path.basename(filePath, '.mdx');
  mdxFilesMap.set(slug, filePath);
});

const allRegistrySlugs = Object.keys(SYLLABUS_MAP);
console.log(`Found ${allRegistrySlugs.length} topics in the syllabus registry.`);

allRegistrySlugs.forEach(slug => {
  const meta = SYLLABUS_MAP[slug];
  const filePath = mdxFilesMap.get(slug);

  let title = meta.title;
  let moduleSlug = meta.moduleSlug;
  let order = meta.order;
  let summaryOneLiner = '';
  let estimatedReadMinutes = 10;
  let generated = true;
  let prerequisiteTopicSlugs: string[] = [];
  let parts: any[] = [];
  let keyTerms: string[] = [];
  let diagrams: DiagramSpec[] = [];
  let topicQAs: InterviewQA[] = [];

  const quality = {
    completeness: filePath ? 100 : 40,
    technicalDepth: filePath ? 100 : 35,
    visualCoverage: filePath ? 100 : 20,
    interviewCoverage: filePath ? 100 : 40,
    revisionCoverage: filePath ? 100 : 30,
    status: filePath ? "published" : "generated"
  };

  if (filePath) {
    const relativePath = path.relative(contentRoot, filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    title = data.title || title;
    moduleSlug = path.dirname(relativePath).replace(/\\/g, '/');
    order = data.order || order;
    summaryOneLiner = data.summaryOneLiner || '';
    estimatedReadMinutes = data.estimatedReadMinutes || 10;
    generated = false;
    prerequisiteTopicSlugs = data.prerequisiteTopicSlugs || [];

    console.log(`  Processing MDX: [${moduleSlug}/${slug}]`);

    // Parse QAs and parts (which parses diagrams internally per part)
    topicQAs = parseInterviewQAs(content, slug);
    parts = parseContentParts(content, topicQAs, slug, diagrams);

    // Extract key terms
    const boldMatches = content.match(/\*\*(.*?)\*\*/g) || [];
    boldMatches.forEach(m => {
      const term = m.slice(2, -2).trim();
      if (term.length > 2 && term.length < 60 && !keyTerms.includes(term) && !/^\d+$/.test(term)) {
        keyTerms.push(term);
        glossaryTerms.push({
          term,
          definition: `${term} — as covered in "${title}" (${moduleSlug.replace(/-/g, ' ')}).`,
          relatedTopicSlugs: [slug],
          sourceModuleSlug: moduleSlug,
        });
      }
    });

    // Write diagram sidecars to /public/diagrams/moduleSlug/slug.diagram.json
    if (diagrams.length > 0) {
      const modDiagDir = path.join(diagramsPublicDir, moduleSlug);
      if (!fs.existsSync(modDiagDir)) fs.mkdirSync(modDiagDir, { recursive: true });
      fs.writeFileSync(path.join(modDiagDir, `${slug}.diagram.json`), JSON.stringify(diagrams, null, 2));
      console.log(`    → ${diagrams.length} diagrams written`);
    }
  } else {
    // Dynamically generate fallback content
    const fallbackData = generateTopicContent(slug);
    if (fallbackData) {
      title = fallbackData.title;
      moduleSlug = fallbackData.moduleSlug;
      summaryOneLiner = fallbackData.summaryOneLiner;
      estimatedReadMinutes = fallbackData.estimatedReadMinutes;
      generated = true;
      prerequisiteTopicSlugs = fallbackData.prerequisiteTopicSlugs || [];
      keyTerms = fallbackData.keyTerms || [];

      // Update parts QAs to have globally unique QA numbers
      parts = (fallbackData.parts || []).map((part: any) => {
        const updatedQAs = (part.interviewQAs || []).map((qa: any) => {
          totalQAs++;
          return {
            ...qa,
            number: totalQAs,
          };
        });
        return {
          ...part,
          interviewQAs: updatedQAs,
        };
      });

      topicQAs = parts.flatMap((p: any) => p.interviewQAs || []);

      // Add glossary terms
      keyTerms.forEach(term => {
        glossaryTerms.push({
          term,
          definition: `${term} — as covered in "${title}" (${moduleSlug.replace(/-/g, ' ')}).`,
          relatedTopicSlugs: [slug],
          sourceModuleSlug: moduleSlug,
        });
      });
      console.log(`  Processing Gen: [${moduleSlug}/${slug}]`);
    }
  }

  // Build manifest entry
  contentManifest[slug] = {
    slug, moduleSlug, title, order, summaryOneLiner, estimatedReadMinutes,
    generated, prerequisiteTopicSlugs, keyTerms: keyTerms.slice(0, 30),
    diagramCount: diagrams.length, qaCount: topicQAs.length, partCount: parts.length,
    parts,
    quality,
  };

  // Build search index
  searchIndex.push({
    type: 'topic', moduleSlug,
    moduleTitle: moduleSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    topicSlug: slug, topicTitle: title, summary: summaryOneLiner, keyTerms,
    concepts: [title, ...keyTerms.slice(0, 10)], relations: prerequisiteTopicSlugs,
    searchableText: `${title} ${summaryOneLiner} ${keyTerms.join(' ')}`,
  });

  topicQAs.forEach(qa => {
    searchIndex.push({
      type: 'interviewQA', moduleSlug,
      moduleTitle: moduleSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      topicSlug: slug, topicTitle: title,
      qaNumber: qa.number, qaQuestion: qa.question, qaAnswer: qa.answer,
      isFiveCrore: qa.isFiveCrore, difficulty: qa.difficulty,
      concepts: [qa.question, title], relations: [slug],
      searchableText: `Q${qa.number} ${qa.question} ${qa.answer}`,
    });
  });
});

// ── MODULES MANIFEST ─────────────────────────────────────────────────────────
const modulesManifest: Record<string, any> = {};
Object.values(contentManifest).forEach((topic: any) => {
  if (!modulesManifest[topic.moduleSlug]) {
    modulesManifest[topic.moduleSlug] = {
      slug: topic.moduleSlug,
      title: topic.moduleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      topics: [],
    };
  }
  const { parts, ...topicMeta } = topic;
  modulesManifest[topic.moduleSlug].topics.push(topicMeta);
});
Object.values(modulesManifest).forEach((mod: any) => {
  mod.topics.sort((a: any, b: any) => a.order - b.order);
});

// ── EMIT ─────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(publicDir, 'content-index.json'), JSON.stringify({ searchIndex, glossaryTerms, totalQAs }, null, 2));
fs.writeFileSync(path.join(publicDir, 'content-manifest.json'), JSON.stringify(contentManifest, null, 2));
fs.writeFileSync(path.join(publicDir, 'modules-manifest.json'), JSON.stringify(modulesManifest, null, 2));

console.log('\n✅ SUCCESS:');
console.log(`   content-index.json    → ${searchIndex.length} entries, ${totalQAs} QAs`);
console.log(`   content-manifest.json → ${Object.keys(contentManifest).length} topics`);
console.log(`   modules-manifest.json → ${Object.keys(modulesManifest).length} modules`);
console.log(`   Glossary terms:         ${glossaryTerms.length}`);
