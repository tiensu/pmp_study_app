import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

test('import-data script runs migration and import commands through docker compose', async () => {
  const scriptPath = path.resolve(process.cwd(), '..', 'scripts', 'import-data.ps1');
  const script = await readFile(scriptPath, 'utf8');

  assert.match(script, /docker compose(?: -f \$ComposeFile)? exec backend node src\/db\/migrate\.js/i);
  assert.match(script, /docker compose(?: -f \$ComposeFile)? exec backend node src\/import\/run-import\.js/i);
});
