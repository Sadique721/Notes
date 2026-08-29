import * as fs from 'fs';
import * as path from 'path';
import { SYLLABUS_MAP } from '../src/lib/syllabusGenerator';

console.log('🔍 Starting Curriculum Registry Audit...\n');

const validModules = [
  'spring-framework-fundamentals',
  'spring-boot',
  'spring-boot-annotations',
  'microservices',
  'java-collections',
  'java-8-17-21',
  'multithreading-concurrency',
  'sql-database',
  'jvm-internals',
  'core-java'
];

const contentRoot = path.join(__dirname, '../content');
const slugs = Object.keys(SYLLABUS_MAP);

let errors = 0;
let physicalCount = 0;
let generatedCount = 0;

slugs.forEach(slug => {
  const meta = SYLLABUS_MAP[slug];
  
  // 1. Check title
  if (!meta.title || meta.title.trim() === '') {
    console.error(`❌ Error: Topic "${slug}" is missing a valid title.`);
    errors++;
  }
  
  // 2. Check module mapping
  if (!validModules.includes(meta.moduleSlug)) {
    console.error(`❌ Error: Topic "${slug}" references an invalid module: "${meta.moduleSlug}".`);
    errors++;
  }
  
  // 3. Check ordering
  if (typeof meta.order !== 'number' || meta.order < 1) {
    console.error(`❌ Error: Topic "${slug}" has an invalid order weight: ${meta.order}.`);
    errors++;
  }

  // 4. Verify physical vs generated status
  const mdxPath = path.join(contentRoot, meta.moduleSlug, `${slug}.mdx`);
  if (fs.existsSync(mdxPath)) {
    physicalCount++;
  } else {
    generatedCount++;
  }
});

console.log('--- AUDIT REPORT ---');
console.log(`Total Modules in Registry: ${validModules.length}`);
console.log(`Total Topics in Registry:  ${slugs.length}`);
console.log(`Physically Coded Topics:   ${physicalCount} (${Math.round(physicalCount/slugs.length*100)}%)`);
console.log(`Dynamically Fallback:      ${generatedCount} (${Math.round(generatedCount/slugs.length*100)}%)`);
console.log('--------------------');

if (errors > 0) {
  console.error(`\n❌ FAILED: Found ${errors} curriculum configuration errors.`);
  process.exit(1);
} else {
  console.log('\n✅ SUCCESS: Curriculum registry structure is 100% valid!');
}
