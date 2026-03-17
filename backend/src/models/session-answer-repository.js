import { query } from '../db/connection.js';

export function createSessionAnswerRepository(database = { query }) {
  return {
    async upsertAnswer({ sessionId, questionId, questionNumber, selectedOption, isCorrect }) {
      const result = await database.query(
        `INSERT INTO session_answers (session_id, question_id, question_number, selected_option, is_correct, answered_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (session_id, question_id)
         DO UPDATE SET
           selected_option = EXCLUDED.selected_option,
           is_correct = EXCLUDED.is_correct,
           answered_at = NOW()
         RETURNING id, session_id AS "sessionId", question_id AS "questionId", question_number AS "questionNumber",
                   selected_option AS "selectedOption", is_correct AS "isCorrect", answered_at AS "answeredAt"`,
        [sessionId, questionId, questionNumber, selectedOption, isCorrect],
      );
      return result.rows[0];
    },

    async listForSession(sessionId) {
      const result = await database.query(
        `SELECT id, session_id AS "sessionId", question_id AS "questionId", question_number AS "questionNumber",
                selected_option AS "selectedOption", is_correct AS "isCorrect", answered_at AS "answeredAt"
         FROM session_answers
         WHERE session_id = $1
         ORDER BY question_number ASC`,
        [sessionId],
      );
      return result.rows;
    },

    async getForSessionQuestion(sessionId, questionNumber) {
      const result = await database.query(
        `SELECT id, session_id AS "sessionId", question_id AS "questionId", question_number AS "questionNumber",
                selected_option AS "selectedOption", is_correct AS "isCorrect", answered_at AS "answeredAt"
         FROM session_answers
         WHERE session_id = $1 AND question_number = $2`,
        [sessionId, questionNumber],
      );
      return result.rows[0] ?? null;
    },
  };
}
