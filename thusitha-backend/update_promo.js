const db = require('./db.js');

async function run() {
  try {
    await db.pool.query("UPDATE Promotions SET image_url = 'https://placehold.co/600x400/png?text=2026+A/L+New+Intake' WHERE promo_id = 1");
    console.log('Updated placeholder image');
  } catch (e) {
    console.error(e);
  } finally {
    db.pool.end();
  }
}
run();
