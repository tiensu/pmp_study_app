import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/server.js';
import { createSessionService } from '../../src/services/session-service.js';
import { createMockRepositories } from '../unit/test-helpers.js';
import { startTestServer } from './test-server.js';

test('Practice mode answer submission returns immediate feedback', async () => {
  const repositories = createMockRepositories();
  const service = createSessionService({
    ...repositories,
    random: (() => {
      const values = [0.75, 0.25, 0.5, 0.1];
      return () => values.shift() ?? 0;
    })(),
  });
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
      body: JSON.stringify({ examSetId: 1, mode: 'practice' }),
    });
    const session = await sessionResponse.json();

    const answerResponse = await fetch(`${testServer.baseUrl}/api/sessions/${session.id}/answers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ questionNumber: 1, selectedOption: 'B' }),
    });
    const answerPayload = await answerResponse.json();

    assert.equal(answerPayload.result, 'incorrect');
    assert.equal(answerPayload.correctOption, 'A');
    assert.match(answerPayload.explanation, /Explanation 3/);
  } finally {
    await testServer.close();
  }
});
