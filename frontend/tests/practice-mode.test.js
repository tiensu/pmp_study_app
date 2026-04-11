import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPracticeFeedback, createStateSnapshot, formatQuestionText, getFeedbackTone } from '../src/scripts/app.js';

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

test('formatQuestionText preserves bullet lists as separate lines', () => {
  const formatted = formatQuestionText(
    'The draft contains: • A definition of the roles and responsibilities of the CCB • A clear description of the process for managing change on the project What feedback might the project manager provide?'
  );

  assert.match(formatted, /The draft contains:<br>• A definition of the roles and responsibilities of the CCB<br>• A clear description of the process for managing change on the project<br>What feedback might the project manager provide\?/);
});
