import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/server.js';
import { createSessionService } from '../../src/services/session-service.js';
import { createMockRepositories } from '../unit/test-helpers.js';
import { startTestServer } from './test-server.js';

test('GET /api/exams and session lifecycle endpoints work for the MVP flow', async () => {
  const service = createSessionService(createMockRepositories());
  const server = createApp({ sessionService: service });
  const testServer = await startTestServer(server);

  try {
    const examsResponse = await fetch(`${testServer.baseUrl}/api/exams`);
    const examsPayload = await examsResponse.json();
    assert.equal(examsPayload.items.length, 1);
    assert.equal(examsPayload.items[0].questionCount, 5);

    const sessionResponse = await fetch(`${testServer.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examSetId: 1, mode: 'practice' }),
    });
    const sessionPayload = await sessionResponse.json();
    assert.equal(sessionPayload.totalQuestions, 5);

    const questionResponse = await fetch(`${testServer.baseUrl}/api/sessions/${sessionPayload.id}/questions/1`);
    const questionPayload = await questionResponse.json();
    assert.equal(questionPayload.questionNumber, 1);

    const resumeResponse = await fetch(`${testServer.baseUrl}/api/sessions/${sessionPayload.id}`);
    const resumePayload = await resumeResponse.json();
    assert.equal(resumePayload.status, 'in_progress');
    assert.equal(resumePayload.totalQuestions, 5);

    const completeResponse = await fetch(`${testServer.baseUrl}/api/sessions/${sessionPayload.id}/complete`, { method: 'POST' });
    const completePayload = await completeResponse.json();
    assert.equal(completePayload.totalQuestions, 5);
    assert.equal(completePayload.summary.unansweredCount, 5);
  } finally {
    await testServer.close();
  }
});
