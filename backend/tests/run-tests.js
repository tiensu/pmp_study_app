import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

const root = process.cwd();
const files = [
  ...(await collectFiles(path.join(root, 'tests'))),
  ...(await collectFiles(path.join(root, '..', 'frontend', 'tests'))),
];

for (const file of files) {
  await import(pathToFileURL(file));
}
