# Tasks: PMP Exam Practice

**Input**: Design documents from `/specs/001-pmp-exam-practice/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include automated test tasks for every behavioral change. This feature requires automated coverage for CSV import validation, session rules, resumed Exam sessions, scoring, import script behavior, and Docker Compose startup.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Database**: `sql/schema/`, `sql/seeds/`
- **Deployment**: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `scripts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and container-ready structure

- [X] T001 Create backend, frontend, sql, and scripts directory structure per implementation plan in backend/, frontend/, sql/, and scripts/
- [X] T002 Initialize backend package configuration and runtime scripts in backend/package.json
- [X] T003 [P] Initialize frontend static entry files in frontend/src/pages/index.html, frontend/src/styles/app.css, and frontend/src/scripts/app.js
- [X] T004 [P] Configure backend and frontend test harness files in backend/tests/run-tests.js, backend/tests/unit/test-helpers.js, and backend/tests/integration/test-server.js
- [X] T005 [P] Create base Docker assets for backend and frontend in backend/Dockerfile and frontend/Dockerfile
- [X] T006 [P] Create top-level Compose orchestration scaffold in docker-compose.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create PostgreSQL schema for exam sets, questions, study sessions, and session answers in sql/schema/001_initial_schema.sql
- [X] T008 [P] Implement backend database connection, migration runner, and environment configuration in backend/src/db/connection.js and backend/src/db/migrate.js
- [X] T009 [P] Implement CSV parsing, validation, and normalized import behavior in backend/src/import/csv-importer.js and backend/src/services/exam-import-service.js
- [X] T010 [P] Implement dedicated operator import entry points in backend/src/import/run-import.js and scripts/import-data.ps1
- [X] T011 [P] Define shared scoring, unanswered-as-incorrect rules, and result-calculation utilities in backend/src/services/scoring-service.js
- [X] T012 [P] Define shared frontend shell, session layout, responsive styles, and state placeholders in frontend/src/pages/index.html and frontend/src/styles/app.css
- [X] T013 [P] Update data model and API contract to align with shorter imported exams and resumed Exam sessions in specs/001-pmp-exam-practice/data-model.md and specs/001-pmp-exam-practice/contracts/study-session-api.md
- [X] T014 Capture Compose startup checks, import workflow notes, and deployment validation guidance in specs/001-pmp-exam-practice/quickstart.md

**Checkpoint**: Foundation ready; user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Start an Exam Set (Priority: P1) 🎯 MVP

**Goal**: Let the learner choose an imported exam set, complete all available questions, and receive final results.

**Independent Test**: Import a CSV file, start a session from the resulting exam set, answer all available questions, and confirm final summary statistics are shown.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T015 [P] [US1] Add import and exam validation unit tests in backend/tests/unit/exam-import-service.test.js
- [X] T016 [P] [US1] Add session creation and final scoring unit tests in backend/tests/unit/session-service.test.js
- [X] T017 [P] [US1] Add API integration coverage for exam listing, session start, question retrieval, and completion in backend/tests/integration/study-session-api.test.js
- [X] T018 [P] [US1] Add frontend session flow tests for exam selection and completion in frontend/tests/session-flow.test.js
- [X] T019 [P] [US1] Add import script behavior test coverage in backend/tests/integration/import-script.test.js

### Implementation for User Story 1

- [X] T020 [P] [US1] Implement exam-set and question repositories in backend/src/models/exam-set-repository.js and backend/src/models/question-repository.js
- [X] T021 [P] [US1] Implement study-session and session-answer repositories in backend/src/models/session-repository.js and backend/src/models/session-answer-repository.js
- [X] T022 [US1] Implement session lifecycle service for start, question progression, and completion in backend/src/services/session-service.js
- [X] T023 [US1] Implement backend routes for exam listing, session creation, question retrieval, and completion in backend/src/routes/exams-routes.js and backend/src/routes/sessions-routes.js
- [X] T024 [US1] Implement backend application bootstrap and static service configuration in backend/src/server.js
- [X] T025 [US1] Implement frontend exam selection, question navigation, and results rendering in frontend/src/pages/index.html and frontend/src/scripts/app.js
- [X] T026 [US1] Implement loading, empty, import-summary, and completion states in frontend/src/styles/app.css and frontend/src/scripts/app.js
- [X] T027 [US1] Verify MVP behavior and record findings for import, session start, question progression, and result rendering in specs/001-pmp-exam-practice/quickstart.md

**Checkpoint**: User Story 1 should now be fully functional and testable independently

---

## Phase 4: User Story 2 - Practice With Immediate Feedback (Priority: P2)

**Goal**: Reveal correctness, correct answer, and explanation immediately after each Practice mode answer.

**Independent Test**: Start a Practice mode session, answer a question, and verify immediate feedback appears before moving to the next question.

### Tests for User Story 2

- [X] T028 [P] [US2] Add unit coverage for Practice mode feedback rules in backend/tests/unit/practice-feedback-service.test.js
- [X] T029 [P] [US2] Add API integration coverage for Practice mode answer submission feedback in backend/tests/integration/practice-mode-api.test.js
- [X] T030 [P] [US2] Add frontend tests for Practice mode feedback and explanation display in frontend/tests/practice-mode.test.js

### Implementation for User Story 2

- [X] T031 [P] [US2] Implement Practice mode feedback formatting service in backend/src/services/practice-feedback-service.js
- [X] T032 [US2] Extend answer-submission route behavior for immediate Practice feedback in backend/src/routes/sessions-routes.js and backend/src/services/session-service.js
- [X] T033 [US2] Implement Practice mode feedback panel and explanation rendering in frontend/src/scripts/app.js and frontend/src/styles/app.css
- [X] T034 [US2] Validate Practice mode UX consistency for feedback placement, answer highlighting, and next-step navigation in frontend/src/pages/index.html and frontend/src/styles/app.css
- [X] T035 [US2] Verify Practice mode response-time expectations and document the result in specs/001-pmp-exam-practice/quickstart.md

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Simulate the Real Exam (Priority: P3)

**Goal**: Support a 180-minute timed Exam mode with deferred feedback and session resume after refresh or reopen.

**Independent Test**: Start an Exam mode session, observe the timer, refresh the app and resume the session, then finish or expire the session and confirm final review appears only at the end.

### Tests for User Story 3

- [X] T036 [P] [US3] Add unit coverage for exam timer deadlines and resume logic in backend/tests/unit/exam-timer-service.test.js
- [X] T037 [P] [US3] Add integration coverage for Exam mode answer submission, resume, expiry, and deferred review in backend/tests/integration/exam-mode-api.test.js
- [X] T038 [P] [US3] Add frontend tests for timer display and resumed Exam sessions in frontend/tests/exam-mode.test.js

### Implementation for User Story 3

- [X] T039 [P] [US3] Implement Exam mode timer and expiry service in backend/src/services/exam-timer-service.js
- [X] T040 [US3] Extend session lifecycle rules for resume, expiry, and deferred review generation in backend/src/services/session-service.js and backend/src/services/scoring-service.js
- [X] T041 [US3] Extend Exam mode API responses to expose countdown and resumed-session state without early feedback in backend/src/routes/sessions-routes.js
- [X] T042 [US3] Implement countdown clock, resumed-session hydration, timeout handling, and final review rendering in frontend/src/scripts/app.js and frontend/src/styles/app.css
- [X] T043 [US3] Validate Exam mode UX consistency for timer visibility, resume messaging, deferred feedback, and timeout results in frontend/src/pages/index.html and frontend/src/styles/app.css
- [ ] T044 [US3] Verify Exam mode performance and timer accuracy expectations in specs/001-pmp-exam-practice/quickstart.md

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Deployment & Cross-Cutting Concerns

**Purpose**: Container delivery, regression coverage, and final polish across all stories

- [X] T045 [P] Add regression coverage for malformed CSV rows, shorter imported exams, unanswered result calculations, and resume behavior in backend/tests/unit/exam-import-service.test.js and backend/tests/integration/study-session-api.test.js
- [X] T046 [P] Implement final Docker Compose service wiring, environment variables, ports, volumes, and startup dependencies in docker-compose.yml
- [X] T047 [P] Add container runtime commands and health-oriented startup behavior in backend/Dockerfile, frontend/Dockerfile, and scripts/import-data.ps1
- [X] T048 Add Compose smoke verification for backend, frontend, PostgreSQL, and import connectivity in backend/tests/integration/compose-smoke.test.js
- [X] T049 Update implementation and deployment notes in specs/001-pmp-exam-practice/quickstart.md and AGENTS.md
- [X] T050 Validate accessibility, copy consistency, responsive behavior, and final cross-mode polish in frontend/src/pages/index.html, frontend/src/styles/app.css, and frontend/src/scripts/app.js
- [ ] T051 Run final verification for Compose startup, import script execution, Practice flow, Exam flow, resumed sessions, and results accuracy in specs/001-pmp-exam-practice/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion and delivers the MVP
- **User Story 2 (Phase 4)**: Depends on User Story 1 answer submission and question rendering
- **User Story 3 (Phase 5)**: Depends on User Story 1 session lifecycle and extends it with timer and resume behavior
- **Deployment & Cross-Cutting (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent MVP after Phase 2
- **US2 (P2)**: Builds on US1 answer submission and question rendering
- **US3 (P3)**: Builds on US1 session lifecycle and adds timer and resume behavior

### Within Each User Story

- Tests MUST be written and fail before implementation
- Repositories and import behavior precede service logic
- Service logic precedes API route updates
- API and backend rules precede frontend integration
- UX validation and performance verification complete before story sign-off

### Parallel Opportunities

- T003 through T006 can run in parallel after T002 where file ownership does not overlap
- T008 through T014 can run in parallel after T007 where file ownership does not overlap
- T015 through T019 can run in parallel for US1
- T020 and T021 can run in parallel for US1
- T028 through T030 can run in parallel for US2
- T036 through T038 can run in parallel for US3
- T045 through T049 can run in parallel during the deployment phase where files do not overlap

## Parallel Example: User Story 1

```text
Task: "T015 [US1] Add import and exam validation unit tests in backend/tests/unit/exam-import-service.test.js"
Task: "T017 [US1] Add API integration coverage for exam listing, session start, question retrieval, and completion in backend/tests/integration/study-session-api.test.js"
Task: "T019 [US1] Add import script behavior test coverage in backend/tests/integration/import-script.test.js"
```

## Parallel Example: User Story 2

```text
Task: "T028 [US2] Add unit coverage for Practice mode feedback rules in backend/tests/unit/practice-feedback-service.test.js"
Task: "T029 [US2] Add API integration coverage for Practice mode answer submission feedback in backend/tests/integration/practice-mode-api.test.js"
Task: "T030 [US2] Add frontend tests for Practice mode feedback and explanation display in frontend/tests/practice-mode.test.js"
```

## Parallel Example: User Story 3

```text
Task: "T036 [US3] Add unit coverage for exam timer deadlines and resume logic in backend/tests/unit/exam-timer-service.test.js"
Task: "T037 [US3] Add integration coverage for Exam mode answer submission, resume, expiry, and deferred review in backend/tests/integration/exam-mode-api.test.js"
Task: "T038 [US3] Add frontend tests for timer display and resumed Exam sessions in frontend/tests/exam-mode.test.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate import, session flow, and final result accuracy

### Incremental Delivery

1. Deliver shared infrastructure plus the P1 exam session flow first
2. Add Practice mode immediate feedback as the second increment
3. Add Exam mode timer and resumed-session behavior as the third increment
4. Add Docker Compose delivery, import script orchestration, and final polish last

### Parallel Team Strategy

1. One developer owns backend persistence, import logic, and API services
2. One developer owns frontend screens, styling, and mode-specific presentation
3. One developer owns tests, Compose setup, and import/deployment verification once foundational work is in place

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map tasks to specific user stories for traceability
- Each user story is independently completable and testable after its phase
- Suggested MVP scope: Phase 1 through Phase 3 only
- All tasks in this file follow the required checklist format with IDs, labels, and file paths

