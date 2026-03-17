# Implementation Plan: PMP Exam Practice

**Branch**: `001-pmp-exam-practice` | **Date**: 2026-03-17 | **Spec**: [spec.md](C:\OneDrive\OneDrive - 株式会社ベリサーブ\ドキュメント\pmp_learning_app\specs\001-pmp-exam-practice\spec.md)
**Input**: Feature specification from `/specs/001-pmp-exam-practice/spec.md`

**Note**: This plan targets a containerized web application using vanilla HTML, CSS, and JavaScript for the client experience, a Node.js backend API, and PostgreSQL persistence, all orchestrated together with one `docker-compose.yml` file.

## Summary

Build a PMP study application that stores question content in PostgreSQL, exposes backend session and scoring logic through a Node.js service, serves a vanilla frontend from its own container, supports Practice and Exam modes, and deploys the backend, frontend, and PostgreSQL services together through a single Docker Compose stack. Include a repeatable import script that loads CSV question files into PostgreSQL.

## Technical Context

**Language/Version**: JavaScript (ES2023), HTML5, CSS3, SQL, Docker Compose
**Primary Dependencies**: Node.js runtime, lightweight HTTP API service for backend routes, pg for PostgreSQL access, vanilla HTML/CSS/JavaScript on the client, containerized frontend static server
**Storage**: PostgreSQL database running as a Compose service for questions, exam sets, session answers, and session summaries
**Testing**: Node test runner for backend logic, browser-oriented frontend helper tests, import validation tests, Docker Compose smoke checks
**Target Platform**: Dockerized local or self-hosted environment with backend, frontend, and PostgreSQL containers running together
**Project Type**: web application
**Performance Goals**: frontend initial load under 2 seconds inside the local containerized stack; next-question navigation and answer submission feedback under 200 ms for normal usage; results rendered in under 1 second after completion; containers start cleanly with one compose command
**Constraints**: preserve a consistent question layout across both modes; keep the frontend mostly vanilla HTML/CSS/JavaScript; support backend, frontend, and PostgreSQL in the same `docker-compose.yml`; provide a dedicated import script for loading CSV data into PostgreSQL; keep the exam timer accurate across the active session; keep service-to-service configuration environment-driven
**Scale/Scope**: single-user study tool with multiple imported exam CSV files, one active session at a time, and local container orchestration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code quality: Use a clear separation between backend API logic, frontend static assets, container configuration, and import automation. Keep import workflow isolated in a dedicated script instead of mixing it with runtime startup behavior.
- Testing: Add automated coverage for CSV import validation, backend session rules, frontend session helpers, and Compose-level smoke verification for service startup and connectivity.
- UX consistency: Reuse one question shell for both modes, keep answer selection and navigation behavior aligned, and ensure containerization does not change visible behavior between local and deployed runs.
- Performance: Validate that backend and frontend containers start predictably, database-backed question retrieval stays responsive, and the import script can load the bundled CSV files without degrading session responsiveness.

## Project Structure

### Documentation (this feature)

```text
specs/001-pmp-exam-practice/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── study-session-api.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── db/
│   ├── import/
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
└── Dockerfile

frontend/
├── src/
│   ├── pages/
│   ├── scripts/
│   ├── styles/
│   └── assets/
└── Dockerfile

scripts/
└── import-data.(ps1|sh)

sql/
├── schema/
└── seeds/

docker-compose.yml
```

**Structure Decision**: Use a three-service Compose stack: a backend container for API/session logic and database access, a frontend container for serving vanilla static assets, and a PostgreSQL container for persistence. Keep data loading as an explicit import script under `scripts/` so operators can rerun imports independently of normal application startup.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
