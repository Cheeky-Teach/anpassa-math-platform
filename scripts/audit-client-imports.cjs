// scripts/audit-client-imports.cjs
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(process.cwd(), 'src');
const BANNED_PATTERNS = [
  /generators\//i,
  /WordProblemInterceptor/i,
  /stories\//i,
  /from ['"].*Gen(\.js|\.ts)?['"]/i
];

let leakCount = 0;

function scanDir(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`Cannot read directory: ${dir}`, err.message);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip the actual source generator & story directories during the audit
      if (fullPath.includes(path.join('src', 'core', 'generators'))) continue;
      if (fullPath.includes(path.join('src', 'core', 'stories'))) continue;
      scanDir(fullPath);
      continue;
    }

    if (!/\.(jsx?|tsx?)$/.test(entry.name)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (/^\s*(import|export)\b/.test(trimmed)) {
        for (const pattern of BANNED_PATTERNS) {
          if (pattern.test(trimmed)) {
            console.error(`🚨 LEAK FOUND: ${path.relative(process.cwd(), fullPath)}:${index + 1}`);
            console.error(`   Line: ${trimmed}`);
            leakCount++;
          }
        }
      }
    });
  }
}

console.log(`\nScanning 'src/' for client-side generator/story imports...`);
scanDir(SRC_DIR);

if (leakCount === 0) {
  console.log(`✅ ZERO client leaks detected! Frontend components only talk via API.\n`);
} else {
  console.warn(`\n⚠️  Found ${leakCount} frontend import(s) that must be removed before migration.\n`);
}