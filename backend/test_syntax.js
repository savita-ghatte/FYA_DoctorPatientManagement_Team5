const fs = require('fs');
const path = require('path');

const files = ['adsahbaord.html', 'drdashbaord.html', 'pdashbaord.html'];

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Extract inline script tags
    const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let index = 0;
    
    console.log(`--- Checking ${file} ---`);
    while ((match = scriptRegex.exec(html)) !== null) {
        const code = match[1];
        try {
            new Function(code);
            console.log(`Script Block ${index}: OK (${code.length} chars)`);
        } catch (err) {
            console.error(`Script Block ${index} ERROR in ${file}:`, err.message);
        }
        index++;
    }
});
