import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { parseCsvFile } from '../../src/import/csv-importer.js';
import { createExamImportService } from '../../src/services/exam-import-service.js';

const samplePath = path.resolve(process.cwd(), '..', 'csv', 'PMP_Questions.csv');

test('parseCsvFile loads the bundled PMP CSV and reports skipped rows', async () => {
  const result = await parseCsvFile(samplePath);
  assert.equal(result.questions.length > 0, true);
  assert.equal(Array.isArray(result.skippedRows), true);
  assert.equal(result.totalRows, 200);
});

test('parseCsvFile normalizes question numbering for valid rows only', async () => {
  const result = await parseCsvFile(samplePath);
  assert.equal(result.questions[0].questionNumber, 1);
  assert.equal(result.questions.at(-1).questionNumber, result.questions.length);
});

test('parseCsvFile skips invalid rows and preserves remaining valid questions', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'pmp-import-'));
  const filePath = path.join(tempDir, 'partial.csv');
  const csv = [
    'No,Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Hint,Explanation,Details for Answer A,Details for Answer B,Details for Answer C,Details for Answer D',
    '1,Valid question,A1,B1,C1,D1,A,,Explanation 1,DA,DB,DC,DD',
    '2,Missing explanation,A2,B2,C2,D2,B,,,,,',
    '3,Second valid,A3,B3,C3,D3,C,,Explanation 3,DA,DB,DC,DD',
  ].join('\n');

  try {
    await writeFile(filePath, csv, 'utf8');
    const result = await parseCsvFile(filePath);
    assert.equal(result.totalRows, 3);
    assert.equal(result.questions.length, 2);
    assert.equal(result.skippedRows.length, 1);
    assert.equal(result.questions[1].questionNumber, 2);
    assert.equal(result.skippedRows[0].sourceNumber, 2);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('importFile records skipped-row summaries for shorter imported exams', async () => {
  const saved = [];
  const replaced = [];
  const service = createExamImportService({
    examSetRepository: {
      async upsert(payload) {
        saved.push(payload);
        return { id: 11, ...payload };
      },
    },
    questionRepository: {
      async replaceForExamSet(examSetId, questions) {
        replaced.push({ examSetId, questions });
      },
    },
  });
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'pmp-import-service-'));
  const filePath = path.join(tempDir, 'shorter.csv');
  const csv = [
    'No,Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Hint,Explanation,Details for Answer A,Details for Answer B,Details for Answer C,Details for Answer D',
    '1,Valid question,A1,B1,C1,D1,A,,Explanation 1,DA,DB,DC,DD',
    '2,Missing explanation,A2,B2,C2,D2,B,,,,,',
  ].join('\n');

  try {
    await writeFile(filePath, csv, 'utf8');
    const result = await service.importFile(filePath);
    assert.equal(result.questionCount, 1);
    assert.equal(result.skippedRowCount, 1);
    assert.equal(replaced[0].questions.length, 1);
    assert.match(saved[0].importSummary, /1 invalid row\(s\) skipped from 2 source row\(s\)/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
