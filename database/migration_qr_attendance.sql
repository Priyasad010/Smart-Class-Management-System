-- Create Attendance_Sessions table
CREATE TABLE IF NOT EXISTS Attendance_Sessions (
    session_id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES Class_Schedules(schedule_id) ON DELETE CASCADE,
    course_id INT REFERENCES Courses(course_id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    qr_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'STOPPED', 'CLOSED')),
    created_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modify Student_Attendance_Logs table to support sessions and methods
ALTER TABLE Student_Attendance_Logs ADD COLUMN IF NOT EXISTS session_id INT REFERENCES Attendance_Sessions(session_id) ON DELETE CASCADE;
ALTER TABLE Student_Attendance_Logs ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'Manual';

-- Add unique constraint for duplicate prevention on student + session
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_student_session'
    ) THEN
        ALTER TABLE Student_Attendance_Logs ADD CONSTRAINT unique_student_session UNIQUE (student_id, session_id);
    END IF;
END $$;
