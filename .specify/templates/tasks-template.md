---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/

**Tests**: Include automated test tasks for every behavioral change. If no tests
are added, the task list MUST explain why the change is documentation-only or
otherwise exempt.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project; adjust based on `plan.md` structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize project dependencies and tooling
- [ ] T003 [P] Configure linting, formatting, and static analysis tools
- [ ] T004 [P] Establish baseline test harness and test data utilities

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can
begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Establish shared architecture and extension points for this feature
- [ ] T006 [P] Implement baseline error handling and telemetry hooks
- [ ] T007 [P] Define shared UX patterns, states, or design tokens needed by the feature
- [ ] T008 Capture performance budgets and the measurement approach for the feature

**Checkpoint**: Foundation ready; user story implementation can now begin in
parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Add unit or contract coverage in tests/[path]
- [ ] T010 [P] [US1] Add integration or end-to-end coverage in tests/[path]

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement core model or state changes in [file]
- [ ] T012 [US1] Implement service or controller logic in [file]
- [ ] T013 [US1] Implement user-facing flow in [file]
- [ ] T014 [US1] Validate loading, empty, success, and error states in [file]
- [ ] T015 [US1] Verify story performance budget and record findings

**Checkpoint**: User Story 1 should now be fully functional and testable
independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T016 [P] [US2] Add unit or contract coverage in tests/[path]
- [ ] T017 [P] [US2] Add integration or end-to-end coverage in tests/[path]

### Implementation for User Story 2

- [ ] T018 [P] [US2] Implement model or state changes in [file]
- [ ] T019 [US2] Implement service or controller logic in [file]
- [ ] T020 [US2] Implement user-facing flow in [file]
- [ ] T021 [US2] Validate UX consistency and visible states in [file]
- [ ] T022 [US2] Verify story performance budget and record findings

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T023 [P] [US3] Add unit or contract coverage in tests/[path]
- [ ] T024 [P] [US3] Add integration or end-to-end coverage in tests/[path]

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement model or state changes in [file]
- [ ] T026 [US3] Implement service or controller logic in [file]
- [ ] T027 [US3] Implement user-facing flow in [file]
- [ ] T028 [US3] Validate UX consistency and visible states in [file]
- [ ] T029 [US3] Verify story performance budget and record findings

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update documentation in docs/ or specs/
- [ ] TXXX Refactor duplicated or unclear code paths
- [ ] TXXX [P] Add any missing regression tests in tests/
- [ ] TXXX Validate accessibility, copy consistency, and responsive behavior
- [ ] TXXX Run final performance verification and document results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests MUST be written and fail before implementation
- Core data or state work precedes service logic
- Service logic precedes user-facing integration
- UX validation and performance verification complete before story sign-off

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- Once Foundational is complete, user stories can proceed in parallel if staffed
- Tests and model tasks within a story marked [P] can run in parallel

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map tasks to specific user stories for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks, same-file conflicts, and undocumented constitution exceptions
