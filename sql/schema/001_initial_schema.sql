CREATE TABLE IF NOT EXISTS exam_sets (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    source_file_name TEXT NOT NULL,
    question_count INTEGER NOT NULL DEFAULT 0,
    skipped_row_count INTEGER NOT NULL DEFAULT 0,
    import_summary TEXT,
    import_status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    exam_set_id BIGINT NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    source_number INTEGER,
    prompt TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    hint TEXT,
    explanation TEXT NOT NULL,
    detail_a TEXT,
    detail_b TEXT,
    detail_c TEXT,
    detail_d TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (exam_set_id, question_number)
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id BIGSERIAL PRIMARY KEY,
    exam_set_id BIGINT NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_questions INTEGER NOT NULL DEFAULT 0,
    current_question_number INTEGER NOT NULL DEFAULT 1,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    correct_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    incorrect_percentage NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS session_answers (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    selected_option TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ,
    UNIQUE (session_id, question_id)
);

CREATE TABLE IF NOT EXISTS session_questions (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    UNIQUE (session_id, question_id),
    UNIQUE (session_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_order
    ON questions (exam_set_id, question_number);

CREATE INDEX IF NOT EXISTS idx_session_answers_session_order
    ON session_answers (session_id, question_number);

CREATE INDEX IF NOT EXISTS idx_session_questions_session_order
    ON session_questions (session_id, question_number);
