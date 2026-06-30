-- Phase 2 Migration Script: Adding missing UML tables and fields

-- 1. Add optional email to Users table
ALTER TABLE Users
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Add moodle_user_id to Students table
ALTER TABLE Students
ADD COLUMN IF NOT EXISTS moodle_user_id VARCHAR(255);

-- 3. Add is_professional_course to Courses table
ALTER TABLE Courses
ADD COLUMN IF NOT EXISTS is_professional_course BOOLEAN DEFAULT FALSE;

-- 4. Create Announcements table
CREATE TABLE IF NOT EXISTS Announcements (
    announcement_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 5. Create Student Achievements table
CREATE TABLE IF NOT EXISTS Student_Achievements (
    achievement_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES Students(student_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    island_rank INT,
    achieved_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
