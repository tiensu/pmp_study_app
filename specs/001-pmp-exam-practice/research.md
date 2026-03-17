# Research: PMP Exam Practice

## Decision 1: Application shape

- Decision: Build a containerized web application with a dedicated backend container, a dedicated frontend container, and a PostgreSQL container orchestrated together by one `docker-compose.yml` file.
- Rationale: This satisfies the deployment requirement directly, keeps responsibilities clear across services, and allows the vanilla frontend to remain simple while still being independently deployable from the backend.
- Alternatives considered:
  - Single backend container serving both API and frontend assets: rejected because the user explicitly wants backend and frontend represented separately in the Compose stack.
  - Separate deployment manifests per service without Compose: rejected because the requirement is for one shared Compose file.

## Decision 2: Data source and ingestion

- Decision: Store questions in PostgreSQL tables and treat CSV files as import sources loaded through a dedicated import script.
- Rationale: This keeps runtime reads inside PostgreSQL, supports repeatable imports, and avoids coupling data ingestion to normal web-server startup.
- Alternatives considered:
  - Reading CSV files directly at runtime: rejected because it bypasses the database-backed design.
  - Importing automatically on every container boot: rejected because it creates unnecessary startup coupling and can duplicate or overwrite data unexpectedly.

## Decision 3: Import automation

- Decision: Add an explicit operator-facing script under `scripts/` that runs migrations if needed and imports all `csv/*.csv` files into PostgreSQL.
- Rationale: A dedicated script is easy to document, rerun, and mount into container workflows such as `docker compose exec` or `docker compose run`.
- Alternatives considered:
  - Manual SQL import steps only: rejected because they are slower and error-prone.
  - Embedding import logic only in package scripts: rejected because the user asked for a standalone script and operational workflows are clearer with one entry point.

## Decision 4: Session persistence

- Decision: Persist active and completed sessions in PostgreSQL, including selected answers, started time, mode, timer deadline, and completion status.
- Rationale: Persisted sessions make timer enforcement, result calculation, and end-of-session review deterministic even when the learner refreshes or reconnects through the containerized stack.
- Alternatives considered:
  - In-memory session state only: rejected because a refresh or container restart would destroy progress.
  - Local browser storage only: rejected because server-owned timing and scoring rules are still required.

## Decision 5: Mode behavior

- Decision: Use one shared question flow for both modes, with a mode flag controlling when feedback, explanations, and the countdown timer appear.
- Rationale: This preserves UX consistency and reduces duplicated logic across the two study experiences.
- Alternatives considered:
  - Separate implementations per mode: rejected because duplication would increase maintenance risk and behavioral drift.

## Decision 6: Timer enforcement

- Decision: Treat the backend session deadline as the source of truth and use the browser countdown only as a synchronized display.
- Rationale: The timer must stay accurate for Exam mode, and backend-owned deadlines prevent client-side tampering or drift from becoming the deciding factor.
- Alternatives considered:
  - Browser-only countdown: rejected because user clock changes or paused tabs could corrupt the exam duration.

## Decision 7: Testing strategy

- Decision: Cover business rules with backend unit tests, exercise core study flows with integration tests, validate import rules with dedicated tests, and add a Compose smoke check for multi-container startup.
- Rationale: The constitution requires automated proof for behavior and performance-sensitive areas, and deployment now includes service orchestration as part of the deliverable.
- Alternatives considered:
  - Manual verification only: rejected because scoring, import, and container integration regressions are too easy to miss.
  - End-to-end browser testing only: rejected because it is slower and less precise for rule-heavy logic and deployment failures.
