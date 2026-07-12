const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '1234';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'thusithaedu_db';

async function runImport() {
  console.log('🏁 Starting Smart Class Management System Database Import...');

  // Step 1: Connect to default 'postgres' database to ensure the target database exists
  const pgClient = new Client({
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: dbPort,
    database: 'postgres'
  });

  try {
    console.log(`🔌 Connecting to default postgres database on ${dbHost}:${dbPort}...`);
    await pgClient.connect();

    const checkDbRes = await pgClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (checkDbRes.rows.length === 0) {
      console.log(`📦 Database '${dbName}' does not exist. Creating database now...`);
      await pgClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully.`);
    } else {
      console.log(`📦 Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('❌ Failed checking/creating database:', err.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }

  // Step 2: Connect to 'thusithaedu_db' to run the SQL schema
  const targetClient = new Client({
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: dbPort,
    database: dbName
  });

  try {
    console.log(`🔌 Connecting to database '${dbName}' to run schema...`);
    await targetClient.connect();

    // Read schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    console.log(`📖 Reading schema file: ${schemaPath}`);
    let schemaSql = fs.readFileSync(schemaPath, 'utf8').trim();

    // Strip /* comment markers if present in schema.sql
    if (schemaSql.startsWith('/*') && schemaSql.endsWith('*/')) {
      schemaSql = schemaSql.substring(2, schemaSql.length - 2).trim();
    }

    console.log('🚀 Running schema.sql queries...');
    await targetClient.query(schemaSql);
    console.log('✅ Schema created successfully!');

    // Read phase 2 migrations
    const migrationPath = path.join(__dirname, '../database/migration_phase2.sql');
    if (fs.existsSync(migrationPath)) {
      console.log(`📖 Reading migration file: ${migrationPath}`);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      console.log('🚀 Running migration_phase2.sql queries...');
      await targetClient.query(migrationSql);
      console.log('✅ Migration applied successfully!');
    }
  } catch (err) {
    console.error('❌ Database migration failed:', err.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }

  // Step 3: Run seed_srilankan_data.js to load test data
  console.log('🌱 Seeding database with Sri Lankan context test data...');
  try {
    // We can require it and run it or execute it. Since it uses process.exit(), let's run it as a subprocess.
    const { execSync } = require('child_process');
    console.log('🚀 Running seed_srilankan_data.js...');
    const output = execSync('node seed_srilankan_data.js', { encoding: 'utf8' });
    console.log(output);
    console.log('🎉 Database import and seeding completed successfully!');
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
    process.exit(1);
  }
}

runImport();
