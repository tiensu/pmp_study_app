import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionService } from '../../src/services/session-service.js';
import { createMockRepositories } from './test-helpers.js';

test('startSession returns an in-progress practice session with total questions', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService(repositories);
  const session = await service.startSession({ examSetId: 1, mode: 'practice' });

  assert.equal(session.mode, 'practice');
  assert.equal(session.status, 'in_progress');
  assert.equal(session.totalQuestions, 5);
});

test('getSession returns import summary and resume metadata for exam mode', async () => {
  const repositories = createMockRepositories({ questionCount: 3, skippedRowCount: 2 });
  const service = createSessionService(repositories);
  const session = await service.startSession({ examSetId: 1, mode: 'exam' });
  const resumed = await service.getSession(session.id);

  assert.equal(resumed.mode, 'exam');
  assert.equal(resumed.totalQuestions, 3);
  assert.match(resumed.importSummary, /2 invalid row\(s\) skipped/);
  assert.ok(resumed.deadlineAt);
});

test('completeSession calculates summary from submitted answers and counts unanswered as incorrect', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService(repositories);
  const session = await service.startSession({ examSetId: 1, mode: 'practice' });
  await service.submitAnswer(session.id, { questionNumber: 1, selectedOption: 'A' });
  await service.submitAnswer(session.id, { questionNumber: 2, selectedOption: 'B' });

  const result = await service.completeSession(session.id);
  assert.equal(result.summary.correctCount, 1);
  assert.equal(result.summary.incorrectCount, 4);
  assert.equal(result.summary.unansweredCount, 3);
});

test('getQuestion and getAllQuestions return practice feedback for previously answered questions', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService(repositories);
  const session = await service.startSession({ examSetId: 1, mode: 'practice' });

  await service.submitAnswer(session.id, { questionNumber: 1, selectedOption: 'A' });

  const question = await service.getQuestion(session.id, 1);
  assert.equal(question.selectedOption, 'A');
  assert.equal(question.feedback.result, 'correct');
  assert.equal(question.feedback.correctOption, 'A');
  assert.match(question.feedback.explanation, /Explanation/);

  const payload = await service.getAllQuestions(session.id);
  assert.equal(payload.questions[0].selectedOption, 'A');
  assert.equal(payload.questions[0].feedback.result, 'correct');
});

test('startSession randomizes question order and keeps it stable within the session', async () => {
  const repositories = createMockRepositories({ questionCount: 4 });
  const randomValues = [0.75, 0.25, 0.5];
  const service = createSessionService({
    ...repositories,
    random: () => randomValues.shift() ?? 0,
  });

  const session = await service.startSession({ examSetId: 1, mode: 'exam' });
  const firstQuestion = await service.getQuestion(session.id, 1);
  const secondQuestion = await service.getQuestion(session.id, 2);
  const repeatedFirstQuestion = await service.getQuestion(session.id, 1);

  assert.equal(firstQuestion.prompt, 'Question 3');
  assert.equal(secondQuestion.prompt, 'Question 2');
  assert.equal(repeatedFirstQuestion.prompt, 'Question 3');
});
