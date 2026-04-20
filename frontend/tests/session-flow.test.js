import test from 'node:test';
import assert from 'node:assert/strict';
import { applyResults, buildQuestionIndexMarkup, buildSessionStatus, createStateSnapshot, summarizeResults } from '../src/scripts/app.js';

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
  assert.match(buildSessionStatus({ mode: 'exam', status: 'in_progress' }, { resumed: true }), /Resumed/);
});

test('question index includes the active exam title', () => {
  const markup = buildQuestionIndexMarkup(
    [{ questionNumber: 1, selectedOption: null, isMarkedForReview: false }],
    'exam',
    'TEST 1',
  );

  assert.match(markup, /Question index - <strong>TEST 1<\/strong>/);
});
