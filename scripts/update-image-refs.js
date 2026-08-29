const fs = require('fs');
const path = require('path');

const contentDir = 'd:/current using file/8-26-2026/injoy&read&play/content';

function walk(dir) {
    let results = [];
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

const mdxFiles = walk(contentDir);

mdxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace .jpg with .gif for illustrations/topics/
    content = content.replace(/\/illustrations\/topics\/([a-zA-Z0-9_-]+)\.jpg/g, '/illustrations/topics/$1.gif');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated JPG -> GIF refs in ${path.basename(filePath)}`);
    }
});

// Insert image ref into hashmap-internals.mdx if not present
const hashmapPath = path.join(contentDir, 'java-collections/hashmap-internals.mdx');
if (fs.existsSync(hashmapPath)) {
    let content = fs.readFileSync(hashmapPath, 'utf8');
    if (!content.includes('hashmap_internals_hero.gif')) {
        const imageTag = `\n![Keywords: HashMap, Bucket, Hash Collision, Rehashing | Hint: An array grid of bucket nodes, with some buckets expanding into linked lists or red-black trees.](/illustrations/topics/hashmap_internals_hero.gif)\n`;
        // Insert below the frontmatter divider '---'
        const parts = content.split('---');
        if (parts.length >= 3) {
            parts[2] = imageTag + parts[2];
            content = parts.join('---');
            fs.writeFileSync(hashmapPath, content, 'utf8');
            console.log('Inserted hashmap_internals_hero.gif into hashmap-internals.mdx');
        }
    }
}
