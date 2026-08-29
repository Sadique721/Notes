const fs = require('fs');
const path = require('path');

const logFile = 'C:\\Users\\MD SADIQUE AMIN\\.gemini\\antigravity-ide\\brain\\d5eba30a-931e-4751-931a-b50e6bb5b5fc\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(logFile)) {
    console.error("Log file not found at: " + logFile);
    process.exit(1);
}

const lines = fs.readFileSync(logFile, 'utf8').split('\n');
console.log(`Scanning ${lines.length} lines...`);

lines.forEach((line, idx) => {
    if (line.includes('what-is-spring.mdx')) {
        try {
            const step = JSON.parse(line);
            if (step.tool_calls) {
                step.tool_calls.forEach(tc => {
                    if (tc.name === 'write_to_file' || tc.name === 'replace_file_content') {
                        const args = tc.args;
                        if (args && args.TargetFile && args.TargetFile.includes('what-is-spring.mdx')) {
                            const content = args.CodeContent || args.ReplacementContent || '';
                            console.log(`Step ${step.step_index} | Type: ${tc.name} | Length: ${content.length} chars | First 200 chars:`);
                            console.log(content.substring(0, 200).replace(/\n/g, ' '));
                            console.log('-'.repeat(50));
                        }
                    }
                });
            }
        } catch(e) {
            // ignore JSON error
        }
    }
});
