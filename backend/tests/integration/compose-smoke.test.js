import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

test('docker compose file defines frontend, backend, and postgres services with expected wiring', async () => {
  const composePath = path.resolve(process.cwd(), '..', 'docker-compose.yml');
  const compose = await readFile(composePath, 'utf8');

  assert.match(compose, /^\uFEFF?services:/m);
  assert.match(compose, /^  postgres:/m);
  assert.match(compose, /^  backend:/m);
  assert.match(compose, /^  frontend:/m);
  assert.match(compose, /healthcheck:/);
  assert.match(compose, /5432:5432/);
  assert.match(compose, /3001:3001/);
  assert.match(compose, /3000:80/);
});
