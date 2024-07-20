const mysql = require('mysql');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a><br><a href="/auth/kakao">Login with Kakao</a>');
}); //카카오 구글 둘 다


router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`안녕하세요, ${req.user.displayName}님!`);
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

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

module.exports = router;