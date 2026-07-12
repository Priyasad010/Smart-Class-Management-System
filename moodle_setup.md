# Moodle Setup Guide

This guide explains how to restore the pre-configured Moodle Learning Management System (LMS) included with the Smart Class Management System.

> **Note**
>
> The provided Moodle installation has already been configured. Web services, REST API, external services, and required API functions are already set up. No additional Moodle configuration is required after restoring the project.

---

# Requirements

Install the following software:

- XAMPP (Apache + PHP)
- PostgreSQL
- pgAdmin (Recommended)

---

# Project Files

The project includes:

```
moodle/
moodledata/
database/
    moodle.backup (or moodle.sql)
```

---

# Step 1 - Copy Moodle Files

Copy the Moodle folder into your XAMPP web directory.

Example:

```
C:\xampp\htdocs\moodle
```

Copy the Moodle data directory to:

```
C:\xampp\moodledata
```

---

# Step 2 - Restore the Database

Open **pgAdmin**.

1. Create a PostgreSQL database named:

```
moodle
```

2. Restore the provided database backup.

- Right-click the database
- Restore...
- Select `moodle.backup` (or execute `moodle.sql`)
- Complete the restore process

---

# Step 3 - Configure Moodle

Open:

```
moodle/config.php
```

Update the following values to match your local environment:

```php
$CFG->dbhost = 'localhost';
$CFG->dbname = 'moodle';
$CFG->dbuser = 'postgres';
$CFG->dbpass = 'YOUR_POSTGRES_PASSWORD';

$CFG->wwwroot = 'http://localhost/moodle';
$CFG->dataroot = 'C:\\xampp\\moodledata';
```

No other changes are normally required.

---

# Step 4 - Enable Required PHP Extensions

Open:

```
C:\xampp\php\php.ini
```

Ensure the following extensions are enabled:

```ini
extension=intl
extension=pgsql
extension=pdo_pgsql
extension=sodium
extension=soap
extension=zip
```

Enable OPcache:

```ini
zend_extension=php_opcache.dll

opcache.enable=1
opcache.enable_cli=1
```

Increase:

```ini
max_input_vars = 5000
```

Save the file and restart Apache.

---

# Step 5 - Start Services

Start the following services:

- Apache
- PostgreSQL

---

# Step 6 - Verify Moodle

Open:

```
http://localhost/moodle
```

The Moodle login page should appear.

---

# Pre-configured Features

The Moodle installation is already configured with:

- PostgreSQL database connection
- REST Web Services enabled
- REST protocol enabled
- External Web Service created
- Required Web Service functions added
- Authorized API user configured
- Web Service token generated
- Smart Class Management System integration settings

No further Moodle configuration is required.

---

# Backend Configuration

Update the backend `.env` file if necessary.

```env
MOODLE_URL=http://localhost/moodle/webservice/rest/server.php
MOODLE_TOKEN=<Provided Moodle Web Service Token>
```

Restart the backend after making any changes.

---

# Default Administrator Account

Use the administrator account provided with the project.

If the administrator password is changed after restoring the database, update it directly through Moodle.

---

# Troubleshooting

## Database Connection Error

- Ensure PostgreSQL is running.
- Verify the database credentials in `config.php`.
- Confirm the `moodle` database has been restored successfully.

## Moodle Does Not Open

- Verify Apache is running.
- Confirm the Moodle folder is located at:

```
C:\xampp\htdocs\moodle
```

- Check that `moodledata` exists at:

```
C:\xampp\moodledata
```

## Missing PHP Extensions

Enable the following extensions in `php.ini`:

- intl
- pgsql
- pdo_pgsql
- sodium
- soap
- zip

Restart Apache after enabling them.

---


# Notes

- Moodle is already configured for use with the Smart Class Management System.
- Restoring the provided database preserves all Moodle settings, web service configurations, and API integrations.
- Only the local database credentials, file paths, and backend environment variables may need to be updated to match the recipient's machine.