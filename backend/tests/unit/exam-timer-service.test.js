import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDeadline, getRemainingSeconds, hasExpired } from '../../src/services/exam-timer-service.js';

test('calculateDeadline adds 180 minutes by default', () => {
  const startedAt = new Date('2026-03-17T08:00:00Z');
  const deadline = calculateDeadline(startedAt);
  assert.equal(deadline.toISOString(), '2026-03-17T11:00:00.000Z');
});

test('hasExpired and getRemainingSeconds reflect the deadline', () => {
  const deadline = '2026-03-17T11:00:00Z';
  assert.equal(hasExpired(deadline, new Date('2026-03-17T10:59:30Z')), false);
  assert.equal(hasExpired(deadline, new Date('2026-03-17T11:00:00Z')), true);
  assert.equal(getRemainingSeconds(deadline, new Date('2026-03-17T10:59:30Z')), 30);
});
