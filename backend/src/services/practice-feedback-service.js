export function buildPracticeFeedback(question, selectedOption) {
  const isCorrect = selectedOption === question.correctOption;
  return {
    result: isCorrect ? 'correct' : 'incorrect',
    selectedOption,
    correctOption: question.correctOption,
    explanation: question.explanation,
    answerDetails: {
      A: question.detailA,
      B: question.detailB,
      C: question.detailC,
      D: question.detailD,
    },
  };
}
