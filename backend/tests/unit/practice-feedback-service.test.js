import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPracticeFeedback } from '../../src/services/practice-feedback-service.js';

const question = {
  correctOption: 'C',
  explanation: 'Detailed explanation',
  detailA: 'A detail',
  detailB: 'B detail',
  detailC: 'C detail',
  detailD: 'D detail',
};

test('buildPracticeFeedback returns correctness and explanation', () => {
  const feedback = buildPracticeFeedback(question, 'A');
  assert.equal(feedback.result, 'incorrect');
  assert.equal(feedback.correctOption, 'C');
  assert.equal(feedback.explanation, 'Detailed explanation');
});
