const db = require('../db');
db.query('SELECT * FROM research_grants').then(r => {
  console.log("Database rows:", JSON.stringify(r.rows, null, 2));
}).catch(console.error).finally(() => db.pool.end());
