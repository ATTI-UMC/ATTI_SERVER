const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

router.get('/mbti', (req, res) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).send('Unauthorized');
  }

  res.send(`
    <form action="/user/mbti" method="POST">
      <label for="mbti">Enter your MBTI:</label>
      <input type="text" id="mbti" name="mbti" required>
      <button type="submit">Submit</button>
    </form>
  `);
});

router.post('/mbti', (req, res) => {
  const { mbti } = req.body;
  const user = req.session.passport.user;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  const nickname = user.id.slice(0, 5);
  const query = 'INSERT INTO User (userid, id, nickname, name) VALUES (?, ?, ?, ?)';
  connection.query(query, [user.id, user.id, nickname, user.name], (err) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).send('An error occurred');
    }
    res.redirect('/profile');
  });
});

module.exports = router;
