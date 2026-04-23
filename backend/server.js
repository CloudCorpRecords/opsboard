const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const config = require('./config');
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:');
// Seed with "Production" data and a "Secret"
db.serialize(() => {
  db.run("CREATE TABLE releases (id INT, ticket_id TEXT, status TEXT, secret_token TEXT)");
  db.run("INSERT INTO releases VALUES (1, 'PROD-101', 'PENDING', 'ghp_INTERNAL_SECRET_KEY_123')");
  db.run("INSERT INTO releases VALUES (2, 'PROD-102', 'DEPLOYED', 'ghp_OTHER_SECRET_456')");
});

// VULNERABILITY 1: SQL Injection
app.get('/api/releases', (req, res) => {
  const query = `SELECT * FROM releases WHERE ticket_id = '${req.query.id}'`;
  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows); // Boss: "Look, I can dump the whole DB from the search bar"
  });
});

// VULNERABILITY 2: No Auth on sensitive action (Ghost Admin)
app.post('/api/approve/:id', (req, res) => {
  // The API endpoint to approve a deploy (/api/approve) doesn't actually check the JWT. 
  // It just checks if the User-Agent contains the word "Admin".
  const userAgent = req.headers['user-agent'] || '';
  if (!userAgent.includes('Admin')) {
    return res.status(403).json({ message: "Forbidden: Admin user-agent required" });
  }

  // Logic to 'deploy' would go here
  db.run(`UPDATE releases SET status = 'DEPLOYED' WHERE id = ${req.params.id}`, (err) => {
    res.json({ message: `Release ${req.params.id} deployed to production!` });
  });
});

app.listen(config.API_PORT, () => console.log(`Vulnerable app running on port ${config.API_PORT}`));
