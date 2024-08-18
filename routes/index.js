const mysql = require('mysql'); 
const express = require('express');
const {addUserInfo}=require('../models/adduser');
const router = express.Router();

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});
router.get('/', (req, res) => {
  res.send(`
    <a href="/auth/google">Login with Google</a><br>
    <a href="/auth/naver">Login with Naver</a><br>
    <a href="/auth/login">Login</a><br>
    <a href="/auth/register">Sign Up</a>
  `);
});
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// 사용자 정보 가져오기 API
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // MySQL 쿼리 작성
  const query = 'SELECT * FROM User WHERE userid = ?';

  // 데이터베이스에서 사용자 정보 조회
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).json({ error: 'An error occurred' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json(results[0]);
    }
  });
});

module.exports = router;
