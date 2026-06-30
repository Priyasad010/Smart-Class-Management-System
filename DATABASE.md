# 🗄️ Database Setup & Configuration

## Overview
This project uses **PostgreSQL** as the database. Everything must be set up manually to save disk space.

---

## Manual Database Setup (Local Development)

You need to set up PostgreSQL manually on your machine.

### Step 1: Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### Step 2: Create Database and User

Open PostgreSQL command line (as `postgres` user):

```bash
psql -U postgres
```

Then run these commands:

```sql
-- Create database
CREATE DATABASE thusithaedu_db;
 
-- Create user
CREATE USER smartclass WITH PASSWORD 'Thusitha@2026';

-- Grant permissions
ALTER ROLE smartclass SET client_encoding TO 'utf8';
ALTER ROLE smartclass SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartclass SET default_transaction_deferrable TO on;
ALTER ROLE smartclass SET default_transaction_read_committed TO on;
GRANT ALL PRIVILEGES ON DATABASE thusithaedu_db TO smartclass;

-- Exit
\q
```

### Step 3: Connect Backend to Database

Edit `thusitha-backend/.env`:

```env
DB_USER=smartclass
DB_PASSWORD=Thusitha@2026
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thusithaedu_db
```

### Step 4: Test Connection

```bash
cd thusitha-backend
npm start
```

You should see:
```
✅ Database Connection Pool established
🚀 Database is reachable at: [timestamp]
```

---

## Database Schema

The system creates the following tables (auto-created on first run):

### Users Table
```sql
-- Users (admin, teachers, parents, students)
users (
  id, email, password, role, created_at, updated_at, ...
)
```

### Students Table
```sql
-- Student records
students (
  id, user_id, registration_number, face_encoding, ...
)
```

### Classes & Courses Table
```sql
-- Classes and course information
classes (
  id, class_code, name, teacher_id, ...
)
```

### Attendance Table
```sql
-- Attendance records
attendance (
  id, student_id, class_id, status, timestamp, ...
)
```

### Payments Table
```sql
-- Payment records
payments (
  id, student_id, amount, date, status, ...
)
```

For complete schema, check your database with:
```bash
psql -U postgres -d thusithaedu_db -c "\dt"
\dt  # List all tables
```

---

## Backup & Restore

### Backup Database

```bash
# Using Docker
docker compose exec database pg_dump -U smartclass -d thusithaedu_db > backup.sql

# Using local PostgreSQL
pg_dump -U smartclass -d thusithaedu_db > backup.sql
```

### Restore Database

```bash
# Using Docker (Note: Ensure thusithaedu_db exists or create it first)
docker compose exec database psql -U smartclass -d thusithaedu_db < backup.sql

# Using local PostgreSQL
psql -U smartclass -d thusithaedu_db < backup.sql
```

---

## Import Initial Data

If you have test data in a CSV or SQL file:

```bash
# Using Docker
docker-compose exec database psql -U smartclass -d smartclass_db < initial-data.sql

# Or copy a file into the container first
docker cp data.csv smart-class-db:/tmp/
docker-compose exec database psql -U smartclass -d smartclass_db -c "\COPY users(email, password, role) FROM '/tmp/data.csv' WITH CSV"
```

---

## Environment Variables

```env
DB_USER=smartclass          # Database user
DB_PASSWORD=password123     # Database password
DB_HOST=localhost           # Host (localhost or "database" for Docker)
DB_PORT=5432                # PostgreSQL default port
DB_NAME=smartclass_db       # Database name
```

### Important Notes:

- **Local development**: `DB_HOST=localhost`
- **Docker development**: `DB_HOST=database` (service name)
- **Production**: Change `DB_PASSWORD` to something strong!

---

## Accessing Database Directly

### Using Docker

```bash
# Connect to PostgreSQL
docker-compose exec database psql -U smartclass -d smartclass_db

# Common commands
\dt                 # List all tables
\d table_name       # Show table structure
SELECT * FROM users;  # Query data
\q                  # Exit
```

### Using Local PostgreSQL

```bash
psql -U smartclass -d smartclass_db
```

---

## Common Issues

### "Database connection failed"
```
Error: Database connection failed
```
- Check PostgreSQL is running: `docker-compose ps`
- Check credentials in `.env`
- Restart: `docker-compose restart database`

### "ECONNREFUSED"
```
Error: ECONNREFUSED 127.0.0.1:5432
```
- Database container not started
- Run: `docker-compose up -d database`
- Wait 10 seconds for it to initialize

### "Role does not exist"
```
Error: role "smartclass" does not exist
```
- Create user: See "Manual Setup" section above
- Or reset: `docker-compose down -v && docker-compose up`

---

## Performance Tips

### For Large Datasets
```sql
-- Create indexes for faster queries
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_attendance_date ON attendance(date);
```

### Connection Pooling
Backend already uses connection pooling (see `db.js`).

---

## Reset Database

```bash
# Docker: Delete all data and rebuild
docker-compose down -v
docker-compose up

# Local: Drop and recreate
psql -U postgres -c "DROP DATABASE smartclass_db;"
# Then follow Manual Setup steps
```

---

## Need Help?

Check the logs:
```bash
docker-compose logs database
```

For detailed PostgreSQL docs: https://www.postgresql.org/docs/
