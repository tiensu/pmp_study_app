export function createMockRepositories({ questionCount = 5, skippedRowCount = 0 } = {}) {
  const examSets = [{
    id: 1,
    title: 'Mock Exam',
    slug: 'mock-exam',
    importStatus: 'ready',
    questionCount,
    skippedRowCount,
    importSummary: skippedRowCount
      ? `${skippedRowCount} invalid row(s) skipped from ${questionCount + skippedRowCount} source row(s).`
      : `Imported ${questionCount} valid question(s) with no skipped rows.`,
  }];
  const questions = Array.from({ length: questionCount }, (_, index) => ({
    id: index + 1,
    examSetId: 1,
    questionNumber: index + 1,
    sourceNumber: index + 1,
    prompt: `Question ${index + 1}`,
    optionA: 'A option',
    optionB: 'B option',
    optionC: 'C option',
    optionD: 'D option',
    correctOption: 'A',
    explanation: `Explanation ${index + 1}`,
    detailA: 'A detail',
    detailB: 'B detail',
    detailC: 'C detail',
    detailD: 'D detail',
  }));

  const sessions = [];
  const answers = [];

  return {
    examSetRepository: {
      async getById(id) {
        return examSets.find((item) => item.id === id) ?? null;
      },
      async listReady() {
        return examSets.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          questionCount: item.questionCount,
          skippedRowCount: item.skippedRowCount,
          importSummary: item.importSummary,
        }));
      },
    },
    questionRepository: {
      async listByExamSet(examSetId) {
        return questions.filter((item) => item.examSetId === examSetId);
      },
      async getByExamSetAndNumber(examSetId, questionNumber) {
        return questions.find((item) => item.examSetId === examSetId && item.questionNumber === questionNumber) ?? null;
      },
    },
    sessionRepository: {
      async create({ examSetId, mode, deadlineAt, totalQuestions }) {
        const session = {
          id: sessions.length + 1,
          examSetId,
          mode,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          deadlineAt: deadlineAt ? deadlineAt.toISOString() : null,
          completedAt: null,
          totalQuestions,
          currentQuestionNumber: 1,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: totalQuestions,
          correctPercentage: 0,
          incorrectPercentage: 0,
        };
        sessions.push(session);
        return session;
      },
      async getById(id) {
        return sessions.find((item) => item.id === id) ?? null;
      },
      async updateProgress(id, currentQuestionNumber) {
        const session = sessions.find((item) => item.id === id);
        session.currentQuestionNumber = currentQuestionNumber;
      },
      async finalize(id, summary, status) {
        const session = sessions.find((item) => item.id === id);
        Object.assign(session, {
          status,
          completedAt: new Date().toISOString(),
          correctCount: summary.correctCount,
          incorrectCount: summary.incorrectCount,
          unansweredCount: summary.unansweredCount,
          correctPercentage: summary.correctPercentage,
          incorrectPercentage: summary.incorrectPercentage,
        });
        return session;
      },
    },
    sessionAnswerRepository: {
      async upsertAnswer({ sessionId, questionId, questionNumber, selectedOption, isCorrect }) {
        const existing = answers.find((item) => item.sessionId === sessionId && item.questionId === questionId);
        if (existing) {
          Object.assign(existing, { selectedOption, isCorrect, questionNumber });
          return existing;
        }
        const answer = { id: answers.length + 1, sessionId, questionId, questionNumber, selectedOption, isCorrect };
        answers.push(answer);
        return answer;
      },
      async listForSession(sessionId) {
        return answers.filter((item) => item.sessionId === sessionId);
      },
      async getForSessionQuestion(sessionId, questionNumber) {
        return answers.find((item) => item.sessionId === sessionId && item.questionNumber === questionNumber) ?? null;
      },
    },
  };
}
