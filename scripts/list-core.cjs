// scripts/list-core.cjs
const fs = require('fs');
const path = require('path');

function walkDir(dir, prefix = '') {
    if (!fs.existsSync(dir)) {
        console.log(`Directory not found: ${dir}`);
        return;
    }
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        console.log(`${prefix}${pointer}${file.name}`);
        if (file.isDirectory()) {
            walkDir(path.join(dir, file.name), prefix + (isLast ? '    ' : '│   '));
        }
    });
}

console.log('📂 src/core/ structure:');
walkDir(path.join(__dirname, '../src/core'));