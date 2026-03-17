import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPracticeFeedback, createStateSnapshot, getFeedbackTone } from '../src/scripts/app.js';

test('Practice mode helpers retain immediate feedback state', () => {
  const snapshot = createStateSnapshot();
  const next = applyPracticeFeedback(snapshot, {
    result: 'correct',
    selectedOption: 'A',
    correctOption: 'A',
    explanation: 'Well done',
  });

  assert.equal(next.feedback.correctOption, 'A');
  assert.equal(next.selectedOption, 'A');
  assert.equal(getFeedbackTone(next.feedback), 'correct');
});
