# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by
  importance. Each user story/journey must be INDEPENDENTLY TESTABLE, meaning if
  you implement just ONE of them, you still deliver a viable MVP.
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently and what
user value it proves]

**UX Consistency Notes**: [Terminology, navigation, accessibility, responsive
behavior, and visible states that must remain consistent]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**UX Consistency Notes**: [State any UI expectations or write N/A if not
user-facing]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**UX Consistency Notes**: [State any UI expectations or write N/A if not
user-facing]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when [boundary condition]?
- How does the system handle [error scenario]?
- How does the experience communicate loading, empty, and failure states?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]
- **FR-004**: System MUST [data requirement]
- **FR-005**: System MUST [behavior]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth
  method not specified]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention
  period not specified]

### Quality Requirements *(mandatory)*

- **QR-001**: The change MUST identify the automated tests that prove each new
  or modified behavior.
- **QR-002**: User-facing work MUST preserve consistent terminology,
  accessibility, and responsive behavior across impacted screens.
- **QR-003**: Performance-sensitive work MUST define measurable budgets and the
  validation method before implementation begins.

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable user or system outcome]
- **SC-002**: [Measurable quality or reliability outcome]
- **SC-003**: [Measurable UX or accessibility outcome]
- **SC-004**: [Measurable performance outcome]
