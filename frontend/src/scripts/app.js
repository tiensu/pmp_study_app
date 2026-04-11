const STORAGE_KEY = 'pmp-active-session-id';
const USER_STORAGE_KEY = 'pmp-user-id';
const USERNAME_STORAGE_KEY = 'pmp-username';

const state = {
  userId: null,
  username: null,
  exams: [],
  session: null,
  allQuestions: [], // Array of all questions with their answers
  question: null,
  selectedOption: null,
  feedback: null,
  result: null,
  historyExam: null,
  history: [],
  resultSource: null,
  deleteMode: false,
  selectedExamsForDelete: new Set(),
};

let timerInterval;

export function formatCountdown(deadlineAt, now = new Date()) {
  if (!deadlineAt) {
    return '';
  }
  const diffMs = Math.max(0, new Date(deadlineAt).getTime() - now.getTime());
  const totalSeconds = Math.ceil(diffMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatBulletPoints(text) {
  if (!text) return text;
  return text.replace(/●\s*/g, '<br/>● ');
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizePromptText(text) {
  let normalized = text.replace(/\r\n?/g, '\n').trim();

  if (/[•●◦▪▫‣]/.test(normalized)) {
    normalized = normalized.replace(/[ \t]*([•●◦▪▫‣])[ \t]*/g, '\n$1 ');
    normalized = normalized.replace(/([^\n])\s+([A-Z][^?\n]*\?)$/, '$1\n$2');
    normalized = normalized.replace(/\n{3,}/g, '\n\n').trim();
  }

  return normalized;
}

function formatRichText(text, { normalizeInlineBullets = false } = {}) {
  if (!text) {
    return '';
  }

  const normalized = normalizeInlineBullets ? normalizePromptTextBlock(text) : text.replace(/\r\n?/g, '\n').trim();
  return escapeHtml(normalized).replace(/\n/g, '<br>');
}

export function formatQuestionText(text) {
  return formatRichText(text, { normalizeInlineBullets: true });
}

function normalizePromptTextBlock(text) {
  let normalized = text.replace(/\r\n?/g, '\n').trim();

  if (/[\u2022\u25CF\u25E6\u25AA\u25AB\u2023]/.test(normalized)) {
    normalized = normalized.replace(/[ \t]*([\u2022\u25CF\u25E6\u25AA\u25AB\u2023])[ \t]*/g, '\n$1 ');
    normalized = normalized.replace(
      /([^\n])\s+((?:What|Which|Who|When|Where|Why|How|Should|Could|Would|Will|Can|Is|Are|Do|Does|Did|Has|Have|Had)\b[^?\n]*\?)$/,
      '$1\n$2'
    );
    normalized = normalized.replace(/\n{3,}/g, '\n\n').trim();
  }

  return normalized;
}

function formatInlineText(text) {
  return formatRichText(text);
}

export function summarizeResults(summary) {
  return [
    { label: 'Correct', value: `${summary.correctCount} (${summary.correctPercentage}%)` },
    { label: 'Incorrect', value: `${summary.incorrectCount} (${summary.incorrectPercentage}%)` },
    { label: 'Unanswered', value: String(summary.unansweredCount) },
  ];
}

function formatSessionScore(session) {
  if (!session.summary) {
    return 'N/A';
  }

  return `${session.summary.correctCount}/${session.totalQuestions} (${session.summary.correctPercentage}%)`;
}

export function getFeedbackTone(feedback) {
  return feedback?.result === 'correct' ? 'correct' : 'incorrect';
}

export function shouldPersistSession(session) {
  return session?.mode === 'exam' && session?.status === 'in_progress';
}

export function buildSessionStatus(session, { resumed = false } = {}) {
  if (session.mode === 'practice') {
    return 'Practice mode shows feedback immediately after each answer.';
  }
  return resumed
    ? 'Resumed your in-progress Exam session.'
    : 'Exam mode hides feedback until the session ends and resumes if you refresh the app.';
}

function qs(id) {
  return document.getElementById(id);
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (state.userId) {
    headers['x-user-id'] = String(state.userId);
  }
  const response = await fetch(url, {
    headers,
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Request failed.');
  }
  return payload;
}

function showToast(message, type = 'info', duration = 3000) {
  const container = qs('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  container.appendChild(toast);

  if (duration && duration > 0) {
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  return toast;
}

function openImportModal() {
  const modal = qs('import-modal');
  modal.classList.remove('modal-hidden');
  qs('csv-file').focus();
}

function closeImportModal() {
  const modal = qs('import-modal');
  modal.classList.add('modal-hidden');
  // Clear form
  qs('csv-file').value = '';
  qs('exam-name').value = '';
}

function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const modal = qs('confirm-modal');
    const messageEl = qs('confirm-modal-message');
    const cancelBtn = qs('confirm-cancel-btn');
    const okBtn = qs('confirm-ok-btn');
    const overlay = modal.querySelector('.modal-overlay');

    // Set message
    messageEl.textContent = message;

    // Show modal
    modal.classList.remove('modal-hidden');

    // Handle buttons
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleOk = () => {
      cleanup();
      resolve(true);
    };

    const handleOverlayClick = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      cancelBtn.removeEventListener('click', handleCancel);
      okBtn.removeEventListener('click', handleOk);
      overlay.removeEventListener('click', handleOverlayClick);
      modal.classList.add('modal-hidden');
    };

    cancelBtn.addEventListener('click', handleCancel);
    okBtn.addEventListener('click', handleOk);
    overlay.addEventListener('click', handleOverlayClick);
  });
}

function persistSessionId(sessionId) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, String(sessionId));
  }
}

function clearPersistedSessionId() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function readPersistedSessionId() {
  return typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
}

function persistUser(userId, username) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_STORAGE_KEY, String(userId));
    window.localStorage.setItem(USERNAME_STORAGE_KEY, String(username));
  }
}

function clearPersistedUser() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(USERNAME_STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_KEY); // Also clear session when logging out
  }
}

function readPersistedUser() {
  if (typeof window === 'undefined') {
    return null;
  }
  const userId = window.localStorage.getItem(USER_STORAGE_KEY);
  const username = window.localStorage.getItem(USERNAME_STORAGE_KEY);
  return userId && username ? { userId: Number(userId), username } : null;
}

function syncPersistedSession(session) {
  if (shouldPersistSession(session)) {
    persistSessionId(session.id);
    return;
  }
  clearPersistedSessionId();
}

function updateNavbarUser(username) {
  const userSpan = qs('navbar-username');
  if (userSpan) {
    userSpan.textContent = `Logged in as: ${username}`;
  }
}

function hideNavbarUser() {
  const userInfo = qs('navbar-user-info');
  if (userInfo) {
    userInfo.style.display = 'none';
  }
}

function showNavbarUser() {
  const userInfo = qs('navbar-user-info');
  if (userInfo) {
    userInfo.style.display = 'flex';
  }
}

function renderLoginScreen() {
  hideNavbarUser();
  qs('app').innerHTML = `
    <section class="login-container">
      <h2>Welcome to PMP Exam Practice</h2>
      <p>Enter your username to continue studying</p>
      <div class="login-form">
        <input 
          type="text" 
          id="username-input" 
          placeholder="Enter your username" 
          autocomplete="off"
          maxlength="50"
        />
        <button id="login-btn">Login</button>
      </div>
      <p class="login-hint">Your progress will be saved between sessions across all devices.</p>
    </section>
  `;

  const usernameInput = qs('username-input');
  const loginBtn = qs('login-btn');

  const handleLogin = async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      showToast('Please enter a username', 'error');
      return;
    }

    try {
      // Show toast for logging in, but auto-dismiss after 3 seconds
      showToast('Logging in...', 'info', 3000);
      const result = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      
      state.userId = result.userId;
      state.username = result.username;
      persistUser(result.userId, result.username);
      updateNavbarUser(result.username);
      
      await loadExamSets();
    } catch (error) {
      showToast(`Login failed: ${error.message}`, 'error');
    }
  };

  loginBtn.addEventListener('click', handleLogin);
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // Focus on input
  usernameInput.focus();
}

async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    // Ignore logout errors because the client clears its local state either way.
  }
  
  state.userId = null;
  state.username = null;
  clearPersistedUser();
  clearState();
  renderLoginScreen();
  showToast('Logged out', 'info');
}

function renderTimer(deadlineAt) {
  const timer = qs('navbar-timer');
  if (!deadlineAt) {
    timer.classList.add('navbar-timer-hidden');
    timer.textContent = '';
    clearInterval(timerInterval);
    return;
  }

  timer.classList.remove('navbar-timer-hidden');
  const update = () => {
    timer.textContent = formatCountdown(deadlineAt);
  };
  update();
  clearInterval(timerInterval);
  timerInterval = setInterval(update, 1000);
}

function renderExamSelection() {
  showNavbarUser();
  const examCards = state.exams.map((exam) => {
    const importSummaryHtml = exam.importSummary && !/^Imported \d+ valid question\(s\) with no skipped rows\.$/.test(exam.importSummary)
      ? `<p>${exam.importSummary}</p>`
      : '';

    if (state.deleteMode) {
      const isSelected = state.selectedExamsForDelete.has(exam.id);
      return `
        <article class="exam-card">
          <div style="display: flex; align-items: start; gap: 0.75rem;">
            <label style="display: flex; align-items: center; cursor: pointer; margin-top: 0.25rem;">
              <input type="checkbox" data-exam-id="${exam.id}" ${isSelected ? 'checked' : ''} style="cursor: pointer;" />
            </label>
            <div style="flex: 1;">
              <h2>${exam.title}</h2>
              <p>Questions: ${exam.questionCount}</p>
              ${importSummaryHtml}
            </div>
          </div>
        </article>
      `;
    }
    return `
      <article class="exam-card">
        <h2>${exam.title}</h2>
        <p>Questions: ${exam.questionCount}</p>
        ${importSummaryHtml}
        <div class="actions">
          <button data-start="${exam.id}:practice">Practice Mode</button>
          <button class="secondary" data-start="${exam.id}:exam">Exam Mode</button>
          <button class="secondary" data-history="${exam.id}">History</button>
        </div>
      </article>
    `;
  }).join('');

  const clearButtonLabel = state.deleteMode 
    ? (state.selectedExamsForDelete.size > 0 ? `Delete (${state.selectedExamsForDelete.size})` : 'Delete')
    : 'Delete';
  const cancelButton = state.deleteMode ? `<button id="cancel-btn" class="secondary" onclick="window.cancelDeleteMode()">Cancel</button>` : '';

  qs('app').innerHTML = `
    <section>
      <h2>Manage Exams</h2>
      <div class="actions" style="margin-bottom: 1.5rem;">
        <button onclick="window.openImportModal()">Import Exam</button>
        <button id="clear-btn" class="secondary" onclick="window.clearAllExams()">${clearButtonLabel}</button>
        ${cancelButton}
      </div>
      <h2>Select an exam set</h2>
      <div class="grid exam-grid">${examCards || '<p>No ready exam sets are available.</p>'}</div>
    </section>
  `;

  if (state.deleteMode) {
    // Add checkbox change listeners with event delegation
    const examGrid = document.querySelector('.exam-grid');
    if (examGrid) {
      examGrid.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
          const examId = Number(e.target.dataset.examId);
          if (e.target.checked) {
            state.selectedExamsForDelete.add(examId);
          } else {
            state.selectedExamsForDelete.delete(examId);
          }
          // Only update button label, don't re-render entire page
          const clearBtn = qs('clear-btn');
          const count = state.selectedExamsForDelete.size;
          clearBtn.textContent = count > 0 ? `Delete (${count})` : 'Delete';
        }
      });
    }
  } else {
    qs('app').querySelectorAll('[data-start]').forEach((button) => {
      button.addEventListener('click', async () => {
        const parts = button.dataset.start.split(':');
        const examSetId = Number(parts[0]);
        const mode = parts[1].trim();
        await startSession({ examSetId, mode });
      });
    });

    qs('app').querySelectorAll('[data-history]').forEach((button) => {
      button.addEventListener('click', async () => {
        const examSetId = Number(button.dataset.history);
        const exam = state.exams.find((item) => item.id === examSetId);
        await loadExamHistory(examSetId, exam?.title ?? 'Exam history');
      });
    });
  }
}

function buildFeedbackMarkup(feedback) {
  if (!feedback) {
    return '';
  }

  const tone = getFeedbackTone(feedback);
  return `
    <section class="feedback ${tone}">
      <p><strong>${feedback.result === 'correct' ? 'Correct' : 'Incorrect'}</strong></p>
      <p>Correct answer: ${feedback.correctOption}</p>
      <p class="question-prompt">${formatQuestionText(feedback.explanation)}</p>
    </section>
  `;
}

function buildImageMarkup(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  return `
    <div class="question-image">
      <img src="${imageUrl}" alt="Question image" />
    </div>
  `;
}

function renderQuestion() {
  showNavbarUser();
  const question = state.question;
  if (!question) {
    console.warn('[renderQuestion] state.question is null or undefined!');
    return;
  }
  const isFinalQuestion = question.questionNumber === question.totalQuestions;
  const answerMarkup = question.options.map((option) => {
    const classes = ['answer-card'];
    if (state.selectedOption === option.key) {
      classes.push('selected');
    }
    if (state.feedback) {
      if (option.key === state.feedback.correctOption) {
        classes.push('correct');
      } else if (option.key === state.selectedOption && state.selectedOption !== state.feedback.correctOption) {
        classes.push('incorrect');
      }
    }
    return `
      <button class="${classes.join(' ')}" data-answer="${option.key}" ${state.feedback ? 'disabled' : ''}>
        <strong>${option.key}.</strong> ${formatInlineText(option.label)}
      </button>
    `;
  }).join('');

  const isMarked = question.isMarkedForReview;
  qs('app').innerHTML = `
    <section>
      <div class="meta">
        <p>Mode: <strong>${state.session.mode === 'practice' ? 'Practice' : 'Exam'}</strong></p>
        <p>Question ${question.questionNumber} of ${question.totalQuestions}</p>
      </div>

      <h3 class="question-prompt">${formatQuestionText(question.prompt)}</h3>
      ${buildImageMarkup(question.imageUrl)}
      <div class="answer-list">${answerMarkup}</div>
      ${buildFeedbackMarkup(state.feedback)}
      <div class="actions">
        <button data-submit ${state.selectedOption ? '' : 'disabled'}>${state.feedback ? (isFinalQuestion ? 'Finish session' : 'Next question') : 'Submit answer'}</button>
        <button class="secondary" data-home>Back to exam list</button>
        <button class="mark-btn${isMarked ? ' marked' : ''}" data-mark>${isMarked ? 'Unmark' : 'Mark for review'}</button>
      </div>
    </section>
  `;
  // Mark for review button
  const markBtn = qs('app').querySelector('[data-mark]');
  if (markBtn) {
    markBtn.addEventListener('click', async () => {
      try {
        const newMark = !question.isMarkedForReview;
        await request(`/api/sessions/${state.session.id}/questions/${question.questionNumber}/mark`, {
          method: 'POST',
          body: JSON.stringify({ isMarked: newMark })
        });
        question.isMarkedForReview = newMark;
        // Nếu đang ở chế độ allQuestions, cập nhật luôn state.allQuestions
        if (state.allQuestions && Array.isArray(state.allQuestions)) {
          const idx = state.allQuestions.findIndex(q => q.questionNumber === question.questionNumber);
          if (idx >= 0) state.allQuestions[idx].isMarkedForReview = newMark;
        }
        renderQuestion();
      } catch (err) {
        showToast('Error updating mark: ' + err.message, 'error');
      }
    });
  }

  qs('app').querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedOption = button.dataset.answer;
      renderQuestion();
    });
  });

  qs('app').querySelector('[data-submit]').addEventListener('click', async () => {
    if (!state.feedback) {
      const payload = await request(`/api/sessions/${state.session.id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ questionNumber: question.questionNumber, selectedOption: state.selectedOption }),
      });

      if (payload.summary) {
        state.result = payload;
        renderResults();
        return;
      }

      if (state.session.mode === 'practice') {
        state.feedback = payload;
        renderQuestion();
        return;
      }

      if (payload.nextQuestionNumber) {
        await loadQuestion(payload.nextQuestionNumber);
      } else {
        await completeSession();
      }
      return;
    }

    if (isFinalQuestion) {
      await completeSession();
    } else {
      await loadQuestion(question.questionNumber + 1);
    }
  });

  qs('app').querySelector('[data-home]').addEventListener('click', async () => {
    clearState();
    await loadExamSets();
  });
}

function buildQuestionIndexMarkup(questions, mode) {
  if (!questions || questions.length === 0) {
    return '';
  }

  const indexMarkup = questions.map((q, i) => {
    const markIcon = q.isMarkedForReview ? '★' : '';
    let statusClass = '';
    let statusText = '';

    if (q.result) {
      statusClass = q.result;
      statusText = q.result;
    } else if (mode === 'practice') {
      // In practice mode: show correct/incorrect/unanswered
      if (!q.selectedOption) {
        statusClass = 'unanswered';
        statusText = 'unanswered';
      } else if (q.feedback) {
        statusClass = q.feedback.result === 'correct' ? 'correct' : 'incorrect';
        statusText = q.feedback.result === 'correct' ? 'correct' : 'incorrect';
      } else {
        statusClass = 'answered';
        statusText = 'answered';
      }
    } else {
      // In exam mode: show answered/unanswered only
      statusClass = q.selectedOption ? 'answered' : 'unanswered';
      statusText = q.selectedOption ? 'answered' : 'unanswered';
    }

    return `<button class="question-index-btn${q.isMarkedForReview ? ' marked' : ''} ${statusClass}" data-jump-to="${i + 1}" title="Q${i + 1}: ${statusText}">${i + 1}${markIcon ? ' <span class=\'mark-icon\'>' + markIcon + '</span>' : ''}</button>`;
  }).join('');

  return `
      <nav class="question-index">
        <p>Question index:</p>
        <div class="index-buttons">
          ${indexMarkup}
        </div>
      </nav>
  `;
}

function renderAllQuestions() {
  showNavbarUser();
  if (!state.allQuestions || state.allQuestions.length === 0) {
    showToast('No questions loaded', 'error');
    return;
  }

  const indexMarkup = buildQuestionIndexMarkup(state.allQuestions, state.session.mode);

  // Build all questions
  const questionsMarkup = state.allQuestions.map((question) => {
    const answerMarkup = question.options.map((option) => {
      const classes = ['answer-card'];
      if (question.selectedOption === option.key) {
        classes.push('selected');
      }
      
      // Get feedback for this question from the question object if it exists
      let feedback = null;
      if (state.session.mode === 'practice') {
        feedback = question.feedback;
      }
      
      if (feedback) {
        if (option.key === feedback.correctOption) {
          classes.push('correct');
        } else if (option.key === question.selectedOption && question.selectedOption !== feedback.correctOption) {
          classes.push('incorrect');
        }
      }
      
      return `
        <button class="${classes.join(' ')}" data-answer="${option.key}" data-question="${question.questionNumber}" ${feedback ? 'disabled' : ''}>
          <strong>${option.key}.</strong> ${formatInlineText(option.label)}
        </button>
      `;
    }).join('');

    const feedbackMarkup = state.session.mode === 'practice' && question.feedback
      ? `
        <section class="feedback ${question.feedback.result === 'correct' ? 'correct' : 'incorrect'}">
          <p><strong>${question.feedback.result === 'correct' ? 'Correct' : 'Incorrect'}</strong></p>
          <p>Correct answer: ${question.feedback.correctOption}</p>
          <p class="question-prompt">${formatQuestionText(question.feedback.explanation)}</p>
        </section>
      `
      : '';

    return `
      <article class="question-card" id="question-${question.questionNumber}">
        <div class="question-header">
          <div>
            <h3>Question ${question.questionNumber}</h3>
          </div>
          <div class="question-actions">
            <span class="question-status">
              ${question.selectedOption ? (state.session.mode === 'practice' && question.feedback 
                ? `<span class="status-tag ${question.feedback.result === 'correct' ? 'correct' : 'incorrect'}">${question.feedback.result === 'correct' ? '✓' : '✗'}</span>`
                : `<span class="status-tag answered">✓</span>`)
              : '<span class="status-tag unanswered">○</span>'}
            </span>
            <button class="mark-btn${question.isMarkedForReview ? ' marked' : ''}" data-mark-q="${question.questionNumber}" title="${question.isMarkedForReview ? 'Unmark' : 'Mark'} for review">
              ${question.isMarkedForReview ? '★' : '☆'}
            </button>
          </div>
        </div>
        <p class="question-prompt">${formatQuestionText(question.prompt)}</p>
        ${buildImageMarkup(question.imageUrl)}
        <div class="answer-list">${answerMarkup}</div>
        ${feedbackMarkup}
      </article>
    `;
  }).join('');

  qs('app').innerHTML = `
    <section class="all-questions-container">
      <div class="meta">
        <p>Mode: <strong>${state.session.mode === 'practice' ? 'Practice' : 'Exam'}</strong></p>
        <p>Total Questions: <strong>${state.allQuestions.length}</strong></p>
      </div>
      
      ${indexMarkup}

      <div class="questions-list">
        ${questionsMarkup}
      </div>

      <div class="actions">
        <button data-complete-session>Complete Session</button>
        <button class="secondary" data-home>Back to exam list</button>
      </div>
    </section>
  `;

  // Setup event listeners for answer selection (auto-save)
  qs('app').querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const questionNumber = Number(e.target.closest('[data-question]').dataset.question);
      const selectedOption = e.target.dataset.answer;
      
      // Update local state
      const questionIndex = state.allQuestions.findIndex(q => q.questionNumber === questionNumber);
      if (questionIndex >= 0) {
        state.allQuestions[questionIndex].selectedOption = selectedOption;
      }

      // Auto-save to backend
      try {
        const payload = await request(`/api/sessions/${state.session.id}/answers`, {
          method: 'POST',
          body: JSON.stringify({ questionNumber, selectedOption }),
        });

        if (payload.summary) {
          // Session completed
          state.result = payload;
          renderResults();
          return;
        }

        // For practice mode, update feedback (payload has correctOption for practice mode)
        if (state.session.mode === 'practice' && payload.correctOption) {
          state.allQuestions[questionIndex].feedback = payload;
        }
      } catch (error) {
        showToast(`Error saving answer: ${error.message}`, 'error');
      }

      // Re-render to show updated state
      renderAllQuestions();
    });
  });

  // Setup event listeners for jumping to questions
  qs('app').querySelectorAll('.question-index-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      const questionNumber = Number(e.currentTarget.dataset.jumpTo);
      const element = document.getElementById(`question-${questionNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Setup complete session button
  const completeBtn = qs('app').querySelector('[data-complete-session]');
  if (completeBtn) {
    completeBtn.addEventListener('click', async () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await completeSession();
    });
  }

  // Setup home button
  const homeBtn = qs('app').querySelector('[data-home]');
  if (homeBtn) {
    homeBtn.addEventListener('click', async () => {
      clearState();
      await loadExamSets();
    });
  }

  // Setup mark for review buttons
  qs('app').querySelectorAll('[data-mark-q]').forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const questionNumber = Number(e.target.dataset.markQ);
      
      try {
        const question = state.allQuestions.find(q => q.questionNumber === questionNumber);
        if (!question) return;
        
        const newMark = !question.isMarkedForReview;
        await request(`/api/sessions/${state.session.id}/questions/${questionNumber}/mark`, {
          method: 'POST',
          body: JSON.stringify({ isMarked: newMark })
        });
        
        question.isMarkedForReview = newMark;
        renderAllQuestions();
      } catch (err) {
        showToast('Error updating mark: ' + err.message, 'error');
      }
    });
  });
}

function buildReviewMarkup(item) {
  const optionsMarkup = Array.isArray(item.options)
    ? item.options.map((option) => {
      const classes = ['review-option'];
      const isSelected = option.key === item.selectedOption;
      const isCorrect = option.key === item.correctOption;

      if (isSelected && isCorrect) {
        classes.push('selected-correct');
      } else if (isSelected) {
        classes.push('selected-incorrect');
      } else if (isCorrect) {
        classes.push('correct');
      }

      const badges = [];
      if (isSelected) {
        badges.push(`<span class="review-option-badge ${isCorrect ? 'correct' : 'incorrect'}">Your answer</span>`);
      }
      if (isCorrect && !isSelected) {
        badges.push('<span class="review-option-badge correct">Correct answer</span>');
      }

      return `
        <li class="${classes.join(' ')}">
          <strong>${option.key}.</strong> ${formatInlineText(option.label ?? '')}
          ${badges.join('')}
        </li>
      `;
    }).join('')
    : '';

  return `
    <article class="review-card" id="question-${item.questionNumber}">
      <div class="meta">
        <h3>Question ${item.questionNumber}</h3>
        <span class="tag ${item.result}">${item.result}</span>
      </div>
      <p class="question-prompt">${formatQuestionText(item.prompt ?? '')}</p>
      <ul class="review-options">${optionsMarkup}</ul>
      <p class="question-prompt">${formatQuestionText(item.explanation)}</p>
    </article>
  `;
}

function renderResults() {
  showNavbarUser();
  clearInterval(timerInterval);
  renderTimer(null);
  clearPersistedSessionId();
  const tiles = summarizeResults(state.result.summary)
    .map((item) => `<div class="summary-tile"><p>${item.label}</p><strong>${item.value}</strong></div>`)
    .join('');
  const review = state.result.reviewItems.map(buildReviewMarkup).join('');

  const importSummaryText = state.session?.importSummary;
  const importSummaryHtml = importSummaryText && !/^Imported \d+ valid question\(s\) with no skipped rows\.$/.test(importSummaryText)
    ? `<p class="import-note">${importSummaryText}</p>`
    : '';

  const resultQuestions = Array.isArray(state.allQuestions) && state.allQuestions.length > 0
    ? state.allQuestions
    : state.result.reviewItems;
  const indexMarkup = buildQuestionIndexMarkup(resultQuestions, state.session?.mode);

  const startedAtText = state.result?.startedAt ? new Date(state.result.startedAt).toLocaleString() : null;
  const completedAtText = state.result?.completedAt ? new Date(state.result.completedAt).toLocaleString() : null;
  const sessionModeText = state.result?.mode === 'practice' ? 'Practice' : 'Exam';

  qs('app').innerHTML = `
    <section>
      <h2>Session results</h2>
      <div class="meta">
        <p>Mode: <strong>${sessionModeText}</strong></p>
        ${startedAtText ? `<p>Started: <strong>${startedAtText}</strong></p>` : ''}
        ${completedAtText ? `<p>Completed: <strong>${completedAtText}</strong></p>` : ''}
      </div>
      ${importSummaryHtml}
      ${indexMarkup}
      <div class="summary-grid">${tiles}</div>
      <div class="actions">
        ${state.resultSource === 'history'
          ? '<button class="secondary" data-history-back>Back to history</button>'
          : '<button data-home>Back to exam list</button>'}
      </div>
      <div class="review-list">${review}</div>
    </section>
  `;

  const historyBackButton = qs('app').querySelector('[data-history-back]');
  if (historyBackButton) {
    historyBackButton.addEventListener('click', () => {
      renderHistory();
    });
  }

  qs('app').querySelectorAll('.question-index-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const questionNumber = Number(event.currentTarget.dataset.jumpTo);
      const element = document.getElementById(`question-${questionNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const homeButton = qs('app').querySelector('[data-home]');
  if (homeButton) {
    homeButton.addEventListener('click', async () => {
      clearState();
      await loadExamSets();
    });
  }
}

async function loadExamHistory(examSetId, examTitle) {
  try {
    const payload = await request(`/api/exams/${examSetId}/sessions`);
    state.historyExam = { id: examSetId, title: examTitle };
    state.history = Array.isArray(payload.items) ? payload.items : [];
    state.result = null;
    state.resultSource = null;
    renderHistory();
  } catch (error) {
    showToast(`Unable to load history: ${error.message}`, 'error');
  }
}

async function loadSessionResult(sessionId) {
  try {
    const payload = await request(`/api/sessions/${sessionId}/results`);
    state.result = payload;
    state.session = {
      id: sessionId,
      examSetId: payload.examSetId,
      mode: payload.mode,
      importSummary: payload.importSummary,
    };
    state.allQuestions = [];
    state.resultSource = 'history';
    renderResults();
  } catch (error) {
    showToast(`Unable to load session result: ${error.message}`, 'error');
  }
}

function renderHistory() {
  showNavbarUser();
  const exam = state.historyExam;
  const rows = state.history.map((session) => {
    const startedAt = session.startedAt ? new Date(session.startedAt).toLocaleString() : 'Unknown';
    const completedAt = session.completedAt ? new Date(session.completedAt).toLocaleString() : 'N/A';
    const scoreText = formatSessionScore(session);
    const modeText = session.mode === 'practice' ? 'Practice' : 'Exam';
    const rowClassName = session.canReview ? 'history-row-clickable' : 'history-row-disabled';
    return `
      <tr class="${rowClassName}" ${session.canReview ? `data-session-id="${session.id}"` : ''}>
        <td>${startedAt}</td>
        <td>${modeText}</td>
        <td>${session.status}</td>
        <td>${scoreText}</td>
        <td>${completedAt}</td>
      </tr>
    `;
  }).join('');

  qs('app').innerHTML = `
    <section>
      <h2>${exam?.title ?? 'Exam'} history</h2>
      <div class="actions">
        <button data-home>Back to exam list</button>
      </div>
      ${state.history.length === 0 ? '<p>No previous practice or exam sessions found for this exam.</p>' : `
        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Score</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <p class="history-hint">Click a completed or expired row to view session details.</p>
        </div>
      `}
    </section>
  `;

  qs('app').querySelector('[data-home]').addEventListener('click', async () => {
    clearState();
    await loadExamSets();
  });

  qs('app').querySelectorAll('tbody tr[data-session-id]').forEach((row) => {
    row.addEventListener('click', async () => {
      const sessionId = Number(row.dataset.sessionId);
      await loadSessionResult(sessionId);
    });
  });
}

function clearState() {
  state.session = null;
  state.question = null;
  state.allQuestions = [];
  state.selectedOption = null;
  state.feedback = null;
  state.result = null;
  state.historyExam = null;
  state.history = [];
  state.resultSource = null;
  clearPersistedSessionId();
}

async function loadExamSets() {
  const payload = await request('/api/exams');
  state.exams = payload.items;
  renderExamSelection();
}

async function startSession({ examSetId, mode }) {
  state.result = null;
  state.feedback = null;
  state.resultSource = null;
  const session = await request('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ examSetId, mode }),
  });
  state.session = session;
  syncPersistedSession(session);
  renderTimer(session.deadlineAt);
  await loadAllQuestions();
}

async function restoreSession(sessionId) {
  const session = await request(`/api/sessions/${sessionId}`);
  if (session.status !== 'in_progress') {
    clearPersistedSessionId();
    return false;
  }
  state.session = session;
  syncPersistedSession(session);
  renderTimer(session.deadlineAt);
  await loadAllQuestions();
  return true;
}

async function loadAllQuestions() {
  try {
    const payload = await request(`/api/sessions/${state.session.id}/questions`);
    if (payload.summary) {
      state.result = payload;
      state.resultSource = 'session';
      renderResults();
      return;
    }
    state.allQuestions = payload.questions || [];
    renderTimer(payload.deadlineAt);
    renderAllQuestions();
  } catch (error) {
    showToast(`Error loading questions: ${error.message}`, 'error');
  }
}

async function loadQuestion(questionNumber) {
  state.selectedOption = null;
  state.feedback = null;
  const payload = await request(`/api/sessions/${state.session.id}/questions/${questionNumber}`);
  if (payload.summary) {
    state.result = payload;
    state.resultSource = 'session';
    renderResults();
    return;
  }
  state.question = payload;
  renderTimer(payload.deadlineAt);
  renderQuestion();
}

async function completeSession() {
  state.result = await request(`/api/sessions/${state.session.id}/complete`, { method: 'POST' });
  state.resultSource = 'session';
  renderResults();
}

export function createStateSnapshot() {
  return JSON.parse(JSON.stringify(state));
}

export function applyPracticeFeedback(snapshot, payload) {
  return {
    ...snapshot,
    feedback: payload,
    selectedOption: payload.selectedOption,
  };
}

export function applyResults(snapshot, payload) {
  return {
    ...snapshot,
    result: payload,
    feedback: null,
    question: null,
  };
}

async function boot() {
  try {
    // Setup modal overlay click handler
    const modal = qs('import-modal');
    const overlay = modal.querySelector('.modal-overlay');
    overlay.addEventListener('click', closeImportModal);

    // Setup navbar home button
    const homeBtn = qs('home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', async () => {
        clearState();
        renderTimer(null);
        await loadExamSets();
      });
    }

    // Setup navbar logout button
    const navbarLogoutBtn = qs('navbar-logout-btn');
    if (navbarLogoutBtn) {
      navbarLogoutBtn.addEventListener('click', logout);
    }

    // Check if user is logged in
    const persistedUser = readPersistedUser();
    if (persistedUser) {
      state.userId = persistedUser.userId;
      state.username = persistedUser.username;
      updateNavbarUser(persistedUser.username);
    } else {
      // No user logged in, show login screen
      renderLoginScreen();
      return;
    }

    // User is logged in, try to restore previous session
    const persistedSessionId = readPersistedSessionId();
    if (persistedSessionId && await restoreSession(Number(persistedSessionId))) {
      return;
    }

    // No active session, load exam sets
    await loadExamSets();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function importExam() {
  const fileInput = qs('csv-file');
  const examNameInput = qs('exam-name');
  if (!fileInput || !fileInput.files.length) {
    showToast('Please select a CSV file first', 'error');
    return;
  }

  const file = fileInput.files[0];
  const customExamName = examNameInput ? examNameInput.value.trim() : '';
  
  try {
    // Show toast for importing, but auto-dismiss after 3 seconds
    showToast(`Importing ${file.name}...`, 'info', 3000);
    const csvContent = await file.text();
    const payload = await request('/api/exams/import', {
      method: 'POST',
      body: JSON.stringify({ 
        csvContent, 
        filename: file.name,
        examName: customExamName || undefined,
      }),
    });
    
    closeImportModal();
    showToast(payload.message, 'success', 4000);
    await loadExamSets();
  } catch (error) {
    showToast(`Import failed: ${error.message}`, 'error', 4000);
  }
}

async function clearAllExams() {
  if (!state.deleteMode) {
    // First click: Enter delete mode
    state.deleteMode = true;
    state.selectedExamsForDelete.clear();
    renderExamSelection();
    return;
  }

  // Second click: Delete selected exams
  if (state.selectedExamsForDelete.size === 0) {
    showToast('Please select an exam to delete', 'info');
    return;
  }

  const count = state.selectedExamsForDelete.size;
  const examWord = count === 1 ? 'exam' : 'exams';
  const confirmed = await showConfirmDialog(`Are you sure you want to delete ${count} ${examWord}?\n\nThis action cannot be undone.`);
  if (!confirmed) {
    return;
  }

  try {
    showToast('Deleting selected exams...', 'info');
    // Delete each selected exam
    const examIds = Array.from(state.selectedExamsForDelete);
    
    for (const examId of examIds) {
      await request(`/api/exams/${examId}`, { method: 'DELETE' });
    }
    
    showToast(`${count} ${examWord} deleted successfully`, 'success');
    state.deleteMode = false;
    state.selectedExamsForDelete.clear();
    await loadExamSets();
  } catch (error) {
    showToast(`Delete failed: ${error.message}`, 'error');
  }
}

function cancelDeleteMode() {
  state.deleteMode = false;
  state.selectedExamsForDelete.clear();
  renderExamSelection();
}

if (typeof window !== 'undefined') {
  window.importExam = importExam;
  window.clearAllExams = clearAllExams;
  window.cancelDeleteMode = cancelDeleteMode;
  window.openImportModal = openImportModal;
  window.closeImportModal = closeImportModal;
  window.logout = logout;
  window.addEventListener('DOMContentLoaded', () => {
    boot();
  });
}

