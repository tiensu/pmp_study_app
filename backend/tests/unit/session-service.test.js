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
  assert.equal(result.reviewItems[0].selectedOption, 'A');
  assert.equal(result.reviewItems[0].selectedOptionLabel, 'A option');
  assert.equal(result.reviewItems[0].correctOption, 'A');
  assert.equal(result.reviewItems[0].correctOptionLabel, 'A option');
  assert.equal(result.reviewItems[0].options.length, 4);
  assert.deepEqual(result.reviewItems[0].options[0], { key: 'A', label: 'A option' });
  assert.deepEqual(result.reviewItems[0].options[3], { key: 'D', label: 'D option' });
  assert.equal(result.reviewItems[2].selectedOption, null);
  assert.equal(result.reviewItems[2].selectedOptionLabel, null);
  assert.equal(result.reviewItems[2].correctOptionLabel, 'A option');
  assert.equal(result.reviewItems[2].options.length, 4);
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

test('listSessionsForExamSet returns history entries with stored summaries', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService(repositories);
  const session = await service.startSession({ examSetId: 1, mode: 'practice' }, 1);

  await service.submitAnswer(session.id, { questionNumber: 1, selectedOption: 'A' });
  await service.completeSession(session.id);

  const history = await service.listSessionsForExamSet(1, 1);

  assert.equal(history.length, 1);
  assert.equal(history[0].canReview, true);
  assert.equal(history[0].summary.correctCount, 1);
  assert.equal(history[0].summary.unansweredCount, 4);
});

test('getResults can refuse to finalize an in-progress session when reviewing history', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService(repositories);
  const session = await service.startSession({ examSetId: 1, mode: 'exam' }, 1);

  await assert.rejects(
    service.getResults(session.id, { finalizeInProgress: false }),
    /not available until the session is completed/i,
  );
});
