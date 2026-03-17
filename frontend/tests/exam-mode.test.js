import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionStatus, formatCountdown, shouldPersistSession } from '../src/scripts/app.js';

test('Exam mode helpers format countdown values', () => {
  const label = formatCountdown('2026-03-17T11:00:00Z', new Date('2026-03-17T10:59:01Z'));
  assert.equal(label, '00:59');
});

test('Exam mode helpers keep only timed sessions persisted', () => {
  assert.equal(shouldPersistSession({ mode: 'exam', status: 'in_progress' }), true);
  assert.equal(shouldPersistSession({ mode: 'exam', status: 'completed' }), false);
  assert.match(buildSessionStatus({ mode: 'exam' }), /hides feedback/);
});
