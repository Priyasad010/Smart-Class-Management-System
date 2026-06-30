const db = require('D:/Smart Class Manegemnt System new/Smart Class Manegemnt System/thusitha-backend/config/db.js');

async function fixDB() {
    try {
        const res = await db.pool.query('SELECT promo_id, image_url FROM Promotions');
        for (const row of res.rows) {
            if (row.image_url && row.image_url.includes('thusitha-backend/uploads/')) {
                const parts = row.image_url.split('thusitha-backend/uploads/');
                const newUrl = 'uploads/' + parts[1];
                await db.pool.query('UPDATE Promotions SET image_url = $1 WHERE promo_id = $2', [newUrl, row.promo_id]);
                console.log(`Updated ${row.promo_id} to ${newUrl}`);
            }
        }
        console.log("Done updating Promotions.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixDB();
