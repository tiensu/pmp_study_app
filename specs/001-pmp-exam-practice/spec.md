# Feature Specification: PMP Exam Practice

**Feature Branch**: `001-pmp-exam-practice`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Build an application to study for PMP examination by answer multiple-choices question. Each Exam have 200 question in file csv/*.csv. There 2 mode to learn: Practice and Exam. With practice mode, the correct answer and detail explaination will be displayed right after user select their anwer. With exam model, it only displayed after user finish 200 questions. Also, there a time clock in exam mode. The duration for each exam is 180 minutes. In both 2 modes, after user finish 200 question, the statistic result is also displayed, include number/percentage of correct/incorrect question."

## Clarifications

### Session 2026-03-17

- Q: How should unanswered questions affect final scoring? → A: Count unanswered questions as incorrect and include them in the incorrect percentage.
- Q: How should invalid CSV imports be handled? → A: Import valid rows only and allow shorter exams.
- Q: What should happen if the learner refreshes or reopens an in-progress Exam session? → A: Resume the same in-progress session.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start an Exam Set (Priority: P1)

As a PMP learner, I want to select an exam set loaded from CSV files and answer
all questions in the selected set so that I can practice against a full-length
or partially validated question bank instead of studying isolated questions.

**Why this priority**: Without loading a complete exam set and moving through
all available questions, the application does not deliver its core study value.

**Independent Test**: Load one CSV-based exam set, start a session, answer all
available questions, and confirm the learner can complete the full question
flow from first question to final results.

**UX Consistency Notes**: The app must use the same question layout, answer
selection pattern, progress indicators, and navigation controls in both
Practice and Exam modes. Question numbering and exam titles must remain visible
and easy to understand on desktop and mobile layouts.

**Acceptance Scenarios**:

1. **Given** exam CSV files are available, **When** the learner chooses an exam
   set, **Then** the system starts a session using the valid imported questions
   from that selected file.
2. **Given** a session has started, **When** the learner answers a question and
   moves forward, **Then** the system records the selected answer and shows the
   next question until all session questions are completed.
3. **Given** the learner reaches the final question, **When** the learner
   submits the session, **Then** the system closes the question flow and shows
   a result summary for that completed exam set.

---

### User Story 2 - Practice With Immediate Feedback (Priority: P2)

As a PMP learner using Practice mode, I want to see the correct answer and a
detailed explanation immediately after each selection so that I can learn from
mistakes while I am still focused on that question.

**Why this priority**: Immediate reinforcement is a major study benefit and
supports understanding, but the application still has baseline value without it
if full exam delivery already works.

**Independent Test**: Start a Practice mode session, answer several questions,
and verify that each question immediately reveals correctness and explanation
before the learner continues.

**UX Consistency Notes**: Immediate feedback must appear in a consistent area of
the screen with clear visual distinction between the learner's choice, the
correct answer, and the explanation text. The experience must keep navigation
predictable and readable without forcing unnecessary page reloads or abrupt
layout shifts.

**Acceptance Scenarios**:

1. **Given** a Practice mode session is active, **When** the learner selects an
   answer, **Then** the system immediately shows whether the answer is correct.
2. **Given** the learner has answered in Practice mode, **When** feedback is
   shown, **Then** the system displays the correct answer and the detailed
   explanation for that question before the learner moves on.
3. **Given** the learner completes all session questions in Practice mode,
   **When** the session ends, **Then** the system displays total correct
   answers, total incorrect answers, and the percentage for each.

---

### User Story 3 - Simulate the Real Exam (Priority: P3)

As a PMP learner using Exam mode, I want a timed 180-minute session with no
answer feedback until the end so that I can simulate the pressure and pacing of
the real examination.

**Why this priority**: Timed simulation is essential for realistic exam
readiness, but it depends on the baseline question flow already being in place.

**Independent Test**: Start an Exam mode session, confirm the 180-minute timer
is shown while answering questions, refresh or reopen the app and confirm the
same in-progress session resumes, then complete or time out the session and
verify that answers, explanations, and final statistics are revealed only after
the session ends.

**UX Consistency Notes**: The countdown clock must remain visible throughout
Exam mode without distracting from the question area. The interface must clearly
signal that explanations are withheld until completion and must present the
final review in the same terminology used during the question flow.

**Acceptance Scenarios**:

1. **Given** the learner starts Exam mode, **When** the session begins, **Then**
   the system starts a visible 180-minute countdown.
2. **Given** an Exam mode session is active, **When** the learner refreshes or
   reopens the app before the timer expires, **Then** the same in-progress
   session resumes with previously recorded answers and the remaining time.
3. **Given** an Exam mode session is active, **When** the learner selects an
   answer, **Then** the system records the choice without showing whether it is
   correct.
4. **Given** the learner finishes all session questions or the timer reaches
   zero, **When** the session ends, **Then** the system displays the correct
   answers, detailed explanations, total correct answers, total incorrect
   answers, and the percentage for each.

### Edge Cases

- What happens when a CSV file contains fewer valid questions because invalid rows are skipped during import?
- How does the system handle a CSV row with missing answer choices, no correct
  answer, or no explanation?
- How does the experience communicate loading, empty, and failure states when
  no exam files are available or an exam file cannot be parsed?
- What happens if the learner reaches the end of the 180-minute timer before
  answering all session questions?
- What happens if the learner leaves questions unanswered before finishing the
  session or when the timer expires?
- What happens if the learner refreshes the page or closes the browser during an
  in-progress Exam mode session?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST load exam sets from `csv/*.csv` and present each
  exam set as a selectable study session.
- **FR-002**: The system MUST validate incoming CSV rows and build each started
  exam session from all valid imported questions, even if invalid rows are
  skipped and the resulting exam set is shorter than 200 questions.
- **FR-003**: The system MUST allow the learner to choose either Practice mode
  or Exam mode before starting a session.
- **FR-004**: The system MUST present one question at a time with its answer
  choices and question number within the active session.
- **FR-005**: The system MUST record the learner's selected answer for every
  question in both modes.
- **FR-006**: In Practice mode, the system MUST immediately display whether the
  selected answer is correct, along with the correct answer and detailed
  explanation for that question.
- **FR-007**: In Exam mode, the system MUST withhold correctness feedback,
  correct answers, and detailed explanations until the session is complete.
- **FR-008**: In Exam mode, the system MUST display a visible countdown clock
  starting from 180 minutes for the active session.
- **FR-009**: In Exam mode, the system MUST resume the same in-progress session
  after the learner refreshes or reopens the app before the session is completed
  or expired.
- **FR-010**: The system MUST end the Exam mode session when all session
  questions are submitted or when the 180-minute duration expires, whichever
  occurs first.
- **FR-011**: After the learner completes a session in either mode, the system
  MUST display summary statistics including number of correct questions, number
  of incorrect questions, percentage correct, and percentage incorrect.
- **FR-012**: After the learner completes a session in Exam mode, the system
  MUST display the correct answer and detailed explanation for each question as
  part of the end-of-session review.
- **FR-013**: The system MUST clearly identify unanswered questions in final
  results and count them as incorrect in the reported statistics and incorrect
  percentage.
- **FR-014**: The system MUST show a clear, user-friendly import summary when an
  exam CSV file contains invalid rows, including that invalid rows were skipped
  and the final session may be shorter than 200 questions.

### Quality Requirements *(mandatory)*

- **QR-001**: The change MUST identify automated tests that verify CSV loading,
  question validation, Practice mode feedback behavior, Exam mode deferred
  feedback behavior, timer handling, resumed Exam mode sessions, and result
  calculations.
- **QR-002**: User-facing screens MUST preserve consistent terminology,
  navigation, progress indicators, feedback placement, and readable layouts
  across Practice mode and Exam mode on common desktop and mobile screen sizes.
- **QR-003**: Starting a session, moving to the next question, selecting an
  answer, and revealing results MUST feel immediate to the learner during normal
  usage, and the specification for implementation MUST define how that
  responsiveness will be verified.

### Key Entities *(include if feature involves data)*

- **Exam Set**: A PMP question collection loaded from one CSV file, including a
  title or identifier and the ordered valid questions it contains.
- **Question**: A single multiple-choice prompt with answer options, one correct
  answer, and a detailed explanation.
- **Session**: A learner's active or completed run through an Exam Set in either
  Practice mode or Exam mode, including selected answers, timing information,
  and completion status.
- **Result Summary**: The calculated outcome of a completed Session, including
  counts and percentages for correct, incorrect, and unanswered questions.

## Assumptions

- Each CSV file is intended to represent one complete exam set, but invalid rows
  may be skipped and the resulting learner session may be shorter than 200 questions.
- Every valid question includes its prompt, answer choices, one correct answer,
  and one detailed explanation.
- Unanswered questions are counted as incorrect and are clearly identified in
  the final results.
- In-progress Exam mode sessions resume after refresh or reopen until they are
  completed or expired.
- The initial release serves one learner at a time on a single device and does
  not require multi-user collaboration features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can start any imported exam set and complete a full
  session in either mode without losing recorded answers.
- **SC-002**: In Practice mode, 100% of answered questions reveal correctness,
  correct answer, and explanation immediately after selection.
- **SC-003**: In Exam mode, 100% of answered questions withhold correctness and
  explanation until the session ends, while the 180-minute timer remains visible
  throughout the active exam.
- **SC-004**: In-progress Exam mode sessions resume with preserved answers and
  remaining time after refresh or reopen for 100% of valid resume attempts.
- **SC-005**: At session completion, the application reports correct and
  incorrect counts and percentages accurately for 100% of completed sessions.
- **SC-006**: Primary learner actions such as starting a session, moving to the
  next question, and revealing end-of-session results are perceived as
  responsive during normal use.
