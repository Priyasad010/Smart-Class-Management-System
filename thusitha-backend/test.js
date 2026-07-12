const db = require('./db');
db.pool.query("SELECT * FROM Learning_Materials").then(res => {
  console.log(res.rows);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
