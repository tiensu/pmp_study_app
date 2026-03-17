# pmp_learning_app Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-17

## Active Technologies
- JavaScript (ES2023), HTML5, CSS3, SQL, Docker Compose + Node.js runtime, lightweight HTTP API service for backend routes, pg for PostgreSQL access, vanilla HTML/CSS/JavaScript on the client, containerized frontend static server (001-pmp-exam-practice)
- PostgreSQL database running as a Compose service for questions, exam sets, session answers, and session summaries (001-pmp-exam-practice)

- JavaScript (ES2023), HTML5, CSS3, SQL + Node.js runtime, local HTTP server, pg for PostgreSQL access, vanilla HTML/CSS/JavaScript on the client (001-pmp-exam-practice)

## Project Structure

```text
backend/
frontend/
sql/
specs/
```

## Commands

cd backend; npm.cmd install
cd backend; npm.cmd run migrate
cd backend; npm.cmd run import
cd backend; npm.cmd start
cd backend; npm.cmd test
docker compose up --build -d
powershell -ExecutionPolicy Bypass -File .\scripts\import-data.ps1
docker compose exec backend node tests/run-tests.js

## Code Style

JavaScript (ES2023), HTML5, CSS3, SQL: Follow standard conventions

## Recent Changes
- 001-pmp-exam-practice: Added JavaScript (ES2023), HTML5, CSS3, SQL, Docker Compose + Node.js runtime, lightweight HTTP API service for backend routes, pg for PostgreSQL access, vanilla HTML/CSS/JavaScript on the client, containerized frontend static server

- 001-pmp-exam-practice: Added local PMP study app backend, PostgreSQL schema/import flow, Docker Compose deployment, resumable Exam sessions, and automated tests

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
