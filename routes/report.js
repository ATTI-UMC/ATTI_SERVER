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

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// 사용자 신고 API
router.post('/user', (req, res) => {
    const { user_id, reported_user_id, reason } = req.body;
  
    const query = 'INSERT INTO ReportUser (user_id, reported_user_id, reason) VALUES (?, ?, ?)';
    connection.query(query, [user_id, reported_user_id, reason], (err, result) => {
      if (err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(201).json({ report_id: result.insertId });
      }
    });
  });
  
  // 게시글 신고 API
  router.post('/post', (req, res) => {
    const { user_id, reported_post_id, reason } = req.body;
  
    const query = 'INSERT INTO ReportPost (user_id, reported_post_id, reason) VALUES (?, ?, ?)';
    connection.query(query, [user_id, reported_post_id, reason], (err, result) => {
      if (err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(201).json({ report_id: result.insertId });
      }
    });
  });
  
module.exports = router;
