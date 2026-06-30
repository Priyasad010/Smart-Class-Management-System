const db = require('./db');
db.pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'").then(r => {
    console.log(r.rows);
    process.exit(0);
}).catch(console.error);
