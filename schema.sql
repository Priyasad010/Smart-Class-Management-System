-- ============================================================
-- Smart Class Management System — Student Management Schema
-- ============================================================

-- Drop table if re-running for fresh setup
DROP TABLE IF EXISTS students;

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE students (
    -- Primary Key
    id                  SERIAL PRIMARY KEY,

    -- Auto-Generated Unique Student ID (e.g. STU-2026-0001)
    student_id_code     VARCHAR(20) UNIQUE NOT NULL,

    -- Personal Details
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    date_of_birth       DATE NOT NULL,
    gender              VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    email               VARCHAR(150),
    phone               VARCHAR(20),
    address             TEXT,

    -- Academic Details
    grade_class         VARCHAR(50),
    enrollment_year     INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),

    -- Parent / Guardian Details (CRITICAL: Required by SMS Notification Module)
    parent_name         VARCHAR(150) NOT NULL,
    parent_phone_number VARCHAR(20)  NOT NULL,   -- Used by SMS Notification Module
    parent_email        VARCHAR(150),

    -- Media
    profile_photo_url   TEXT,
    qr_code_url         TEXT,

    -- Status
    is_active           BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGER: Auto-update updated_at on row modification
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES for fast search/filter queries
-- ============================================================
CREATE INDEX idx_students_student_id_code  ON students(student_id_code);
CREATE INDEX idx_students_first_name       ON students(first_name);
CREATE INDEX idx_students_last_name        ON students(last_name);
CREATE INDEX idx_students_grade_class      ON students(grade_class);
CREATE INDEX idx_students_is_active        ON students(is_active);
CREATE INDEX idx_students_enrollment_year  ON students(enrollment_year);

-- ============================================================
-- SMS LOGS TABLE
-- ============================================================
CREATE TABLE sms_logs (
    id            SERIAL PRIMARY KEY,
    student_id    INT REFERENCES students(id) ON DELETE CASCADE,
    parent_phone  VARCHAR(20) NOT NULL,
    message       TEXT NOT NULL,
    type          VARCHAR(50), -- 'Manual', 'Bulk'
    status        VARCHAR(20), -- 'Delivered', 'Failed'
    sent_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_logs_student_id ON sms_logs(student_id);
CREATE INDEX idx_sms_logs_status     ON sms_logs(status);

-- ============================================================
-- TEACHERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
    id              SERIAL PRIMARY KEY,
    teacher_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    qualification   TEXT,
    specialization  VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_teachers_updated_at
BEFORE UPDATE ON teachers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id              SERIAL PRIMARY KEY,
    subject_code    VARCHAR(50) UNIQUE NOT NULL,
    subject_name    VARCHAR(100) NOT NULL,
    grade           VARCHAR(20) NOT NULL,
    course_type     VARCHAR(50), -- e.g. 'O/L', 'A/L', 'Professional'
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TEACHER SUBJECTS (BRIDGE TABLE)
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id              SERIAL PRIMARY KEY,
    teacher_id      INT REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id      INT REFERENCES subjects(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_id)
);

CREATE INDEX idx_teachers_teacher_id_code ON teachers(teacher_id_code);
CREATE INDEX idx_subjects_subject_code    ON subjects(subject_code);
CREATE INDEX idx_teacher_subjects_mapping ON teacher_subjects(teacher_id, subject_id);