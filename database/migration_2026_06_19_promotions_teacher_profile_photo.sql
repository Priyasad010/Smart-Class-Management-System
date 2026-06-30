ALTER TABLE Teachers
ADD COLUMN IF NOT EXISTS profile_photo_path TEXT;

CREATE TABLE IF NOT EXISTS Promotions (
    promo_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
