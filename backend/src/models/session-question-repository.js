import { query } from '../db/connection.js';

export function createSessionQuestionRepository(database = { query }) {
  return {
    async replaceForSession(sessionId, questions) {
      await database.query('DELETE FROM session_questions WHERE session_id = $1', [sessionId]);

      for (const [index, question] of questions.entries()) {
        await database.query(
          `INSERT INTO session_questions (session_id, question_id, question_number, is_marked_for_review)
           VALUES ($1, $2, $3, FALSE)`,
          [sessionId, question.id, index + 1],
        );
      }
    },

    async getForSessionQuestion(sessionId, questionNumber) {
      const result = await database.query(
        `SELECT q.id, q.exam_set_id AS "examSetId", sq.question_number AS "questionNumber",
                q.source_number AS "sourceNumber", q.prompt, q.image_url AS "imageUrl",
                q.option_a AS "optionA", q.option_b AS "optionB", q.option_c AS "optionC", q.option_d AS "optionD",
                q.correct_option AS "correctOption", q.hint, q.explanation,
                q.detail_a AS "detailA", q.detail_b AS "detailB", q.detail_c AS "detailC", q.detail_d AS "detailD",
                sq.is_marked_for_review AS "isMarkedForReview"
         FROM session_questions sq
         INNER JOIN questions q ON q.id = sq.question_id
         WHERE sq.session_id = $1 AND sq.question_number = $2`,
        [sessionId, questionNumber],
      );
      return result.rows[0] ?? null;
    },

    async listForSession(sessionId) {
      const result = await database.query(
        `SELECT q.id, q.exam_set_id AS "examSetId", sq.question_number AS "questionNumber",
                q.source_number AS "sourceNumber", q.prompt, q.image_url AS "imageUrl",
                q.option_a AS "optionA", q.option_b AS "optionB", q.option_c AS "optionC", q.option_d AS "optionD",
                q.correct_option AS "correctOption", q.hint, q.explanation,
                q.detail_a AS "detailA", q.detail_b AS "detailB", q.detail_c AS "detailC", q.detail_d AS "detailD",
                sq.is_marked_for_review AS "isMarkedForReview"
         FROM session_questions sq
         INNER JOIN questions q ON q.id = sq.question_id
         WHERE sq.session_id = $1
         ORDER BY sq.question_number ASC`,
        [sessionId],
      );
      return result.rows;
    },

    async setMarkForReview(sessionId, questionNumber, isMarked) {
      await database.query(
        `UPDATE session_questions SET is_marked_for_review = $1 WHERE session_id = $2 AND question_number = $3`,
        [isMarked, sessionId, questionNumber],
      );
    },
  };
}
