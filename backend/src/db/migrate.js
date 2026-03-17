import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { closePool, resolveProjectPath, runSqlFile } from './connection.js';

export async function migrate() {
  const schemaDir = resolveProjectPath('sql', 'schema');
  const files = (await readdir(schemaDir))
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  for (const fileName of files) {
    await runSqlFile(path.join(schemaDir, fileName));
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  migrate()
    .then(async () => {
      console.log('Database schema applied.');
      await closePool();
    })
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exitCode = 1;
    });
}
