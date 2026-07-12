const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'thusithaedu_db',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function printSchema() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    const tables = {};
    for (const row of res.rows) {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push(`${row.column_name} (${row.data_type})`);
    }
    console.log(JSON.stringify(tables, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching schema', error);
    process.exit(1);
  }
}

printSchema();
