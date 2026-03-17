# Contract: Study Session API

This contract describes the local HTTP interface between the vanilla browser UI
and the local backend.

## GET /api/exams

Returns all exam sets that are ready to start.

### Response 200

```json
{
  "items": [
    {
      "id": 1,
      "slug": "pmp-questions",
      "title": "Pmp Questions",
      "questionCount": 198,
      "skippedRowCount": 2,
      "importSummary": "2 invalid row(s) skipped from 200 source row(s)."
    }
  ]
}
```

## POST /api/sessions

Starts a new study session.

### Request

```json
{
  "examSetId": 1,
  "mode": "practice"
}
```

### Response 201

```json
{
  "id": 7,
  "examSetId": 1,
  "mode": "practice",
  "status": "in_progress",
  "currentQuestionNumber": 1,
  "totalQuestions": 198,
  "deadlineAt": null,
  "importSummary": "2 invalid row(s) skipped from 200 source row(s)."
}
```

### Rules

- `mode` must be `practice` or `exam`.
- If `mode` is `exam`, `deadlineAt` is set to 180 minutes after session start.
- Sessions can start for any exam set with at least one valid imported question.
- The frontend should persist and reuse `id` for in-progress Exam sessions so `GET /api/sessions/:sessionId` can restore state after refresh or reopen.

## GET /api/sessions/:sessionId

Returns current session metadata for resume flows.

### Response 200

```json
{
  "id": 7,
  "examSetId": 1,
  "mode": "exam",
  "status": "in_progress",
  "currentQuestionNumber": 24,
  "totalQuestions": 198,
  "deadlineAt": "2026-03-17T10:30:00Z",
  "importSummary": "2 invalid row(s) skipped from 200 source row(s)."
}
```

## GET /api/sessions/:sessionId/questions/:questionNumber

Returns one question in session context.

### Response 200

```json
{
  "sessionId": 7,
  "mode": "exam",
  "questionNumber": 24,
  "totalQuestions": 198,
  "prompt": "Question text",
  "options": [
    { "key": "A", "label": "Option A" },
    { "key": "B", "label": "Option B" },
    { "key": "C", "label": "Option C" },
    { "key": "D", "label": "Option D" }
  ],
  "selectedOption": null,
  "feedback": null,
  "deadlineAt": "2026-03-17T10:30:00Z",
  "importSummary": "2 invalid row(s) skipped from 200 source row(s)."
}
```

### Rules

- Practice mode may include immediate feedback after an answer is submitted.
- Exam mode must not include correctness or explanation before completion.

## POST /api/sessions/:sessionId/answers

Submits or updates one answer for the active session.

### Request

```json
{
  "questionNumber": 24,
  "selectedOption": "B"
}
```

### Response 200 for Practice mode

```json
{
  "questionNumber": 24,
  "selectedOption": "B",
  "result": "incorrect",
  "correctOption": "D",
  "explanation": "Detailed explanation text",
  "nextQuestionNumber": 25
}
```

### Response 200 for Exam mode

```json
{
  "questionNumber": 24,
  "selectedOption": "B",
  "result": "recorded",
  "nextQuestionNumber": 25,
  "deadlineAt": "2026-03-17T10:30:00Z",
  "totalQuestions": 198
}
```

### Rules

- Exam mode responses must not expose `correctOption` or `explanation` before completion.
- If the session deadline has passed, the backend returns a completion or expiry response instead of recording a new answer.

## POST /api/sessions/:sessionId/complete

Ends the active session and returns final results.

### Response 200

```json
{
  "sessionId": 7,
  "status": "completed",
  "totalQuestions": 198,
  "summary": {
    "correctCount": 132,
    "incorrectCount": 66,
    "unansweredCount": 8,
    "correctPercentage": 66.67,
    "incorrectPercentage": 33.33
  },
  "reviewItems": [
    {
      "questionNumber": 1,
      "selectedOption": "A",
      "correctOption": "C",
      "result": "incorrect",
      "explanation": "Detailed explanation text"
    }
  ]
}
```

### Rules

- Practice mode may return review items after completion even though immediate feedback was already shown.
- Exam mode must return review items only after completion or expiry.
- Unanswered questions count as incorrect in the final percentages.
- Final summary values must be internally consistent and total `totalQuestions`.

## GET /api/sessions/:sessionId/results

Returns the completed or expired session summary and review items.

### Response 200

Same shape as `POST /api/sessions/:sessionId/complete`.

## Error Contract

### Response 400 or 422

```json
{
  "error": {
    "code": "INVALID_EXAM_DATA",
    "message": "The selected exam set does not contain any valid questions."
  }
}
```

### Response Codes

- `EXAM_NOT_FOUND`
- `INVALID_EXAM_DATA`
- `SESSION_NOT_FOUND`
- `SESSION_ALREADY_FINISHED`
- `SESSION_EXPIRED`
- `INVALID_ANSWER_OPTION`
