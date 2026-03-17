import test from 'node:test';
import assert from 'node:assert/strict';
import { applyResults, buildSessionStatus, createStateSnapshot, shouldPersistSession, summarizeResults } from '../src/scripts/app.js';

test('session flow helpers store final results cleanly', () => {
  const snapshot = createStateSnapshot();
  const next = applyResults(snapshot, {
    summary: { correctCount: 120, incorrectCount: 70, unansweredCount: 10, correctPercentage: 60, incorrectPercentage: 35 },
    reviewItems: [],
  });

  assert.equal(next.result.summary.correctCount, 120);
  assert.equal(next.feedback, null);
  assert.equal(summarizeResults(next.result.summary)[0].value, '120 (60%)');
});

test('session flow helpers describe exam resume behavior', () => {
  assert.equal(shouldPersistSession({ mode: 'exam', status: 'in_progress' }), true);
  assert.equal(shouldPersistSession({ mode: 'practice', status: 'in_progress' }), false);
  assert.match(buildSessionStatus({ mode: 'exam', status: 'in_progress' }, { resumed: true }), /Resumed/);
});
