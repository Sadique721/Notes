import { exec } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = 'http://localhost:3000/topic/what-is-spring';

console.log('Starting headless Chrome to scan console logs...');

const cmd = `"${chromePath}" --headless --disable-gpu --enable-logging --v=1 "${url}"`;

const proc = exec(cmd, (err, stdout, stderr) => {
  console.log('--- CHROME STDOUT ---');
  console.log(stdout);
  console.log('--- CHROME STDERR ---');
  console.log(stderr);
  if (err) {
    console.error('Chrome process error:', err);
  }
});

// Terminate chrome after 8 seconds
setTimeout(() => {
  console.log('Terminating Chrome...');
  proc.kill();
}, 8000);
