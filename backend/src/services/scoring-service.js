export function calculateSummary(questions, answers) {
  const totalQuestions = questions.length;
  const answerByQuestion = new Map(answers.map((answer) => [answer.questionNumber, answer]));

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const reviewItems = questions.map((question) => {
    const answer = answerByQuestion.get(question.questionNumber);
    if (!answer || !answer.selectedOption) {
      unansweredCount += 1;
      incorrectCount += 1;
      return {
        questionNumber: question.questionNumber,
        prompt: question.prompt,
        selectedOption: null,
        correctOption: question.correctOption,
        explanation: question.explanation,
        result: 'unanswered',
      };
    }

    const isCorrect = answer.selectedOption === question.correctOption;
    if (isCorrect) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }

    return {
      questionNumber: question.questionNumber,
      prompt: question.prompt,
      selectedOption: answer.selectedOption,
      correctOption: question.correctOption,
      explanation: question.explanation,
      result: isCorrect ? 'correct' : 'incorrect',
    };
  });

  const correctPercentage = Number(((correctCount / totalQuestions) * 100).toFixed(2));
  const incorrectPercentage = Number(((incorrectCount / totalQuestions) * 100).toFixed(2));

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    correctPercentage,
    incorrectPercentage,
    reviewItems,
  };
}
