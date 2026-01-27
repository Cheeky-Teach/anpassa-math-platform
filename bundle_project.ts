/**
 * AI CONTEXT BUNDLER
 * Purpose: Flattens a React project into a single text file for AI analysis.
 * Usage: node bundle_project.js
 * Output: project_context.txt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration: Folders and Extensions to include
const CONFIG = {
  rootDir: '.',
  outputFile: 'project_context.txt',
  includeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json'],
  excludeDirs: ['node_modules', '.git', 'dist', 'build', '.vscode']
};

function getFiles(dir) {
  const subdirs = fs.readdirSync(dir);
  const files = [];

  subdirs.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!CONFIG.excludeDirs.includes(file)) {
        files.push(...getFiles(fullPath));
      }
    } else {
      if (CONFIG.includeExtensions.includes(path.extname(file))) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

function bundle() {
  console.log('📦 Starting Project Bundle...');
  const allFiles = getFiles(CONFIG.rootDir);
  let output = `PROJECT EXPORT GENERATED AT ${new Date().toISOString()}\n\n`;

  // 1. Generate File Tree
  output += "--- FILE STRUCTURE ---\n";
  allFiles.forEach(f => {
    // Only show relative paths
    output += `${path.relative(CONFIG.rootDir, f)}\n`;
  });
  output += "\n" + "=".repeat(50) + "\n\n";

  // 2. Dump File Contents
  allFiles.forEach(filePath => {
    // Skip the bundle script itself and the output file
    if (filePath.includes('bundle_project.js') || filePath.includes(CONFIG.outputFile)) return;
    if (filePath.includes('package-lock.json')) return; // Too verbose

    const relativePath = path.relative(CONFIG.rootDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    output += `\n// =======================================================\n`;
    output += `// FILE START: ${relativePath}\n`;
    output += `// =======================================================\n\n`;
    output += content;
    output += `\n\n// FILE END: ${relativePath}\n`;
  });

  fs.writeFileSync(CONFIG.outputFile, output);
  console.log(`✅ Success! Bundled ${allFiles.length} files into '${CONFIG.outputFile}'`);
  console.log(`🚀 Upload this file to your AI assistant.`);
}

bundle();