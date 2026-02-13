const Database = require('better-sqlite3');
try {
    const db = new Database('sqlite.db', { verbose: console.log });
    const rows = db.prepare('SELECT count(*) as count FROM gallery_items').get();
    console.log('Gallery items count:', rows.count);

    if (rows.count > 0) {
        const items = db.prepare('SELECT title, afterImageUrl FROM gallery_items LIMIT 5').all();
        console.log('Sample items:', items);
    }
} catch (e) {
    console.error('Error checking DB:', e);
}
