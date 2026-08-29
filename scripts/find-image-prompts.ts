import * as fs from 'fs';
import * as path from 'path';

const logPath = 'C:\\Users\\MD SADIQUE AMIN\\.gemini\\antigravity-ide\\brain\\d5eba30a-931e-4751-931a-b50e6bb5b5fc\\.system_generated\\logs\\transcript_full.jsonl';

function findImagePrompts() {
  if (!fs.existsSync(logPath)) {
    console.error("Log file not found: " + logPath);
    return;
  }

  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  let count = 0;

  for (let line of lines) {
    if (line.includes('generate_image')) {
      try {
        const step = JSON.parse(line);
        if (step.tool_calls) {
          for (let tc of step.tool_calls) {
            if (tc.name === 'generate_image') {
              console.log(`Step ${step.step_index} | ImageName: ${tc.args.ImageName} | Prompt: ${tc.args.Prompt}`);
              count++;
            }
          }
        }
      } catch (e) {
        // Skip JSON parse errors
      }
    }
  }

  console.log(`Total image generation calls found in current log: ${count}`);
}

findImagePrompts();
