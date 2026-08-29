const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = 'd:/current using file/8-26-2026/injoy&read&play/public/illustrations/topics';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

files.forEach(f => {
    const src = path.join(dir, f);
    const dest = path.join(dir, f.replace('.jpg', '.gif'));
    const script = path.join(__dirname, 'convert-to-gif.ps1');
    const cmd = `powershell -File "${script}" "${src}" "${dest}"`;
    try {
        execSync(cmd);
        console.log(`Successfully converted ${f} to GIF`);
    } catch (err) {
        console.error(`Failed to convert ${f}:`, err.message);
    }
});
