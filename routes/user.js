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

  const user = req.session.passport.user;
  const query = 'SELECT MBTI_FK FROM User WHERE userid = ?';
  connection.query(query, [user], (err, results) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json({ mbti: results[0].MBTI_FK });
  });
});


router.post('/mbti', (req, res) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).send('Unauthorized');
  }

  const { mbti } = req.body;
  const user = req.session.passport.user;

  const query = 'UPDATE User SET MBTI_FK = ? WHERE userid = ?';
  connection.query(query, [mbti, user], (err) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).send('MBTI updated successfully');
  });
});

module.exports = router;