const db = require('./config/db'); db.pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = ''students''').then(r =; process.exit(0)}).catch(console.error);  
