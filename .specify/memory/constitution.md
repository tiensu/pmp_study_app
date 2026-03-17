<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Added I. Code Quality Is a Feature
- Added II. Tests Prove Behavior
- Added III. Consistent User Experience
- Added IV. Performance Has Defined Budgets
Added sections:
- Delivery Workflow & Quality Gates
- Feature Definition Standards
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->
# PMP Learning App Constitution

## Core Principles

### I. Code Quality Is a Feature
All production code MUST be readable, reviewable, and intentionally simple.
Changes MUST preserve clear naming, small cohesive units, explicit error
handling, and removal of dead code before merge. Reviews MUST reject ad hoc
workarounds, duplicated business logic, and undocumented exceptions to
established patterns. Rationale: maintainable code reduces learning cost,
regression risk, and long-term delivery drag.

### II. Tests Prove Behavior
Every behavioral change MUST include automated tests at the lowest effective
level and MUST keep the full affected test suite passing before merge. Bug fixes
MUST add or update a regression test that fails before the fix. Tests MUST be
deterministic, isolated, and readable enough to act as executable examples of
expected behavior. Rationale: test coverage is the primary proof that learning
flows, scoring logic, and content handling remain correct as the app evolves.

### III. Consistent User Experience
User-facing changes MUST preserve a coherent interaction model across screens,
including terminology, navigation patterns, empty states, loading states, and
error feedback. New UI work MUST define acceptance criteria for accessibility,
responsive behavior, and content clarity. Product decisions MUST prefer
predictability over novelty unless a change measurably improves comprehension or
task completion. Rationale: learners succeed faster when the interface behaves
consistently and communicates clearly.

### IV. Performance Has Defined Budgets
Features MUST declare measurable performance expectations before implementation
and MUST not merge when they violate agreed budgets without documented approval.
Interactive user actions SHOULD complete within 200 ms for common flows, initial
screen loads SHOULD complete within 2 seconds on a typical network, and
background processing MUST avoid unnecessary memory or battery usage. Any change
with likely performance impact MUST include profiling, benchmarking, or an
explicit verification note. Rationale: responsive learning experiences improve
retention and reduce abandonment.

## Feature Definition Standards

Every feature specification MUST define user value, testable acceptance
scenarios, UX consistency expectations, and measurable success criteria. Specs
for user-facing work MUST state responsive and accessibility expectations. Specs
for potentially expensive workflows MUST include target latency or throughput
budgets and the measurement approach that will be used during validation.

## Delivery Workflow & Quality Gates

Implementation plans MUST pass a constitution check before design or coding
begins. Task lists MUST include work for code quality, automated testing, UX
validation, and performance validation whenever a change affects those areas.
Before merge, each change MUST demonstrate:

- passing automated tests relevant to the change
- review confirmation that the implementation matches established code patterns
- UX verification for states the user can see or interact with
- performance verification when the change can affect response time, rendering,
  or resource usage

## Governance

This constitution overrides conflicting local habits or undocumented team
preferences. Amendments MUST be recorded in this file, include a short rationale,
and update any impacted templates in `.specify/templates/` within the same
change. Versioning follows semantic rules for governance documents: MAJOR for
backward-incompatible principle changes or removals, MINOR for new principles or
materially expanded guidance, and PATCH for clarifications that do not change
expected behavior. Compliance is reviewed in every plan, spec, task list, and
implementation review.

**Version**: 1.0.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-17
