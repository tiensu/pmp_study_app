export function calculateDeadline(startedAt, durationMinutes = 180) {
  return new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
}

export function hasExpired(deadlineAt, now = new Date()) {
  if (!deadlineAt) {
    return false;
  }
  return now.getTime() >= new Date(deadlineAt).getTime();
}

export function getRemainingSeconds(deadlineAt, now = new Date()) {
  if (!deadlineAt) {
    return null;
  }
  const diffMs = new Date(deadlineAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 1000));
}
