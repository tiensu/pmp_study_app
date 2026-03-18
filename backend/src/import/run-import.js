import { createExamImportService } from '../services/exam-import-service.js';
import { closePool } from '../db/connection.js';

const service = createExamImportService();
const directoryPath = process.argv[2];

service.importDirectory(directoryPath)
  .then(async (items) => {
    for (const item of items) {
      console.log(`${item.slug}: ${item.questionCount} valid question(s), ${item.skippedRowCount} skipped row(s)`);
    }
    await closePool();
  })
  .catch(async (error) => {
    console.error(error);
    await closePool();
    process.exitCode = 1;
  });