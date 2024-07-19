const mysql = require('mysql');
const express = require('express');
const router = express.Router();

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

// MySQL 연결 설정, 개개인마다 다를겁니다.
const connection = mysql.createConnection({
  host: 'localhost',  // MySQL 호스트 주소
  user: 'root',   // MySQL 사용자 이름
  password: '3386',  // MySQL 비밀번호
  database: 'ATTI'  // ATTI 데이터베이스 이름
});

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});


module.exports = router;