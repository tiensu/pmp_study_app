import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/server.js';
import { createSessionService } from '../../src/services/session-service.js';
import { createMockRepositories } from '../unit/test-helpers.js';
import { startTestServer } from './test-server.js';

test('Exam mode answer submission hides correctness until completion', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService(repositories);
  const authHeaders = { 'Content-Type': 'application/json', 'x-user-id': '1' };
  const server = createApp({
    sessionService: service,
    examSetRepository: repositories.examSetRepository,
    questionRepository: repositories.questionRepository,
    sessionRepository: repositories.sessionRepository,
    userRepository: repositories.userRepository,
  });
  const testServer = await startTestServer(server);

  try {
    const sessionResponse = await fetch(`${testServer.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ examSetId: 1, mode: 'exam' }),
    });
    const session = await sessionResponse.json();

    const answerResponse = await fetch(`${testServer.baseUrl}/api/sessions/${session.id}/answers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ questionNumber: 1, selectedOption: 'B' }),
    });
    const answerPayload = await answerResponse.json();

    assert.equal(answerPayload.result, 'recorded');
    assert.equal('correctOption' in answerPayload, false);
    assert.ok(answerPayload.deadlineAt);

    const resumeResponse = await fetch(`${testServer.baseUrl}/api/sessions/${session.id}`, {
      headers: authHeaders,
    });
    const resumePayload = await resumeResponse.json();
    assert.equal(resumePayload.mode, 'exam');
    assert.equal(resumePayload.status, 'in_progress');
    assert.ok(resumePayload.deadlineAt);
  } finally {
    await testServer.close();
  }
});
