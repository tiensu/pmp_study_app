# Data Model: PMP Exam Practice

## ExamSet

Represents one imported PMP exam built from a single CSV source.

### Fields

- `id`: unique identifier
- `slug`: human-readable unique key for routing and selection
- `title`: display name for the exam set
- `source_file_name`: original CSV file name
- `question_count`: number of valid imported questions available to learners
- `skipped_row_count`: number of invalid CSV rows skipped during import
- `import_summary`: user-facing summary of import warnings or skipped rows
- `import_status`: `draft`, `ready`, or `invalid`
- `created_at`: import timestamp
- `updated_at`: last modification timestamp

### Validation Rules

- `question_count` must be greater than zero before `import_status` can become `ready`.
- `slug` must be unique.
- Invalid imports with zero valid questions must not be startable by learners.

## Question

Represents one valid question within an exam set.

### Fields

- `id`: unique identifier
- `exam_set_id`: owning exam set
- `question_number`: normalized display order within the imported exam set
- `source_number`: original row number or source question number from the CSV file
- `prompt`: question text
- `option_a`: answer choice A
- `option_b`: answer choice B
- `option_c`: answer choice C
- `option_d`: answer choice D
- `correct_option`: expected answer key
- `explanation`: detailed explanation shown after evaluation
- `created_at`: import timestamp

### Validation Rules

- `question_number` must be unique within an exam set.
- `correct_option` must match one of the stored answer choices.
- `prompt`, answer choices, and `explanation` must be non-empty.

## StudySession

Represents one learner attempt of an exam set in either Practice or Exam mode.

### Fields

- `id`: unique identifier
- `exam_set_id`: selected exam set
- `mode`: `practice` or `exam`
- `status`: `in_progress`, `completed`, or `expired`
- `started_at`: session start time
- `deadline_at`: exam end time for Exam mode, null for Practice mode
- `completed_at`: finish time when the session ends
- `total_questions`: number of valid imported questions included in this session
- `current_question_number`: latest active question position
- `correct_count`: final correct answer count
- `incorrect_count`: final incorrect answer count, including unanswered questions
- `unanswered_count`: final unanswered count
- `correct_percentage`: final correct percentage
- `incorrect_percentage`: final incorrect percentage, including unanswered questions

### Validation Rules

- `deadline_at` is required for Exam mode and must be exactly 180 minutes after `started_at`.
- Final counts must total `total_questions` when the session is completed or expired.
- `completed_at` must be set when `status` is `completed` or `expired`.

### State Transitions

- `in_progress` -> `completed` when all questions are submitted.
- `in_progress` -> `expired` when the deadline passes before all questions are answered.
- An in-progress Exam mode session may be resumed after refresh or reopen using the same persisted session record.
- Completed or expired sessions are immutable except for read-only review queries.

## SessionAnswer

Represents the learner response to one question within a study session.

### Fields

- `id`: unique identifier
- `session_id`: owning study session
- `question_id`: answered question
- `selected_option`: learner's chosen answer, nullable until answered
- `is_correct`: computed correctness flag
- `answered_at`: answer timestamp

### Validation Rules

- A session can have at most one answer record per question.
- `selected_option` must be one of the allowed answer keys when present.
- `is_correct` is derived from `selected_option` and the related question's `correct_option`.

## SessionReviewItem

Logical read model used for final review screens.

### Fields

- `question_number`: display order
- `prompt`: question text
- `selected_option`: learner's answer or null
- `correct_option`: correct answer
- `explanation`: explanation text
- `result`: `correct`, `incorrect`, or `unanswered`

### Relationships

- One `ExamSet` has many `Question` records.
- One `ExamSet` has many `StudySession` records.
- One `StudySession` has many `SessionAnswer` records.
- One `Question` can appear in many `SessionAnswer` records across sessions.
