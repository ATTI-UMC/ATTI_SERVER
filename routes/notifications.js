const express = require('express');
const router = express.Router();
const mysql = require ('mysql');

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

// 알림 생성 API
router.post('/', (req, res) => {
    const { user_id, message } = req.body;
    const query = 'INSERT INTO Notification (user_id, message) VALUES (?, ?)';
    connection.query(query, [user_id, message], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ notification_id: result.insertId });
        }
    });
  });
  
  // 알림 조회 API
  router.get('/:user_id', (req, res) => {
    const { user_id } = req.params;
    connection.query('SELECT * FROM Notification WHERE user_id = ?', [user_id], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      else if (results.length === 0) {
        return res.status(404).json({ error: 'No notifications found' });
      }
      else{
      res.status(200).json(results);
      }
    });
  });

// 알림 삭제 API
router.delete('/', (req, res) => {
  const { user_id, notification_id } = req.body;
  const query = 'DELETE FROM Notification WHERE user_id = ? AND notification_id = ?';
  connection.query(query, [user_id, notification_id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Notification not found' });
    } else {
      res.status(200).json({ message: 'Notification deleted successfully' });
    }
  });
});

  module.exports = router;
