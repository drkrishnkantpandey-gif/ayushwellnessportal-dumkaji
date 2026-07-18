const { getMyApplications } = require('../controllers/researchGrantController');
const db = require('../db');

const req = {
  user: { userId: 38 }
};

const res = {
  json: (data) => {
    console.log("Mock getMyApplications response:", JSON.stringify(data, null, 2));
    db.pool.end();
  },
  status: (code) => ({
    json: (data) => {
      console.log(`Status ${code}:`, data);
      db.pool.end();
    }
  })
};

getMyApplications(req, res);
