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
  const query = `
      SELECT
          n.notification_id,
          n.user_id,
          CASE
              WHEN n.board_id IS NOT NULL THEN b.title
              WHEN n.chatroom_id IS NOT NULL THEN cr.title
              WHEN n.group_chatroom_id IS NOT NULL THEN gc.title
              ELSE NULL
          END AS title,
          CASE
              WHEN n.board_id IS NOT NULL THEN b.content
              WHEN n.chatroom_id IS NOT NULL THEN cr.content
              WHEN n.group_chatroom_id IS NOT NULL THEN gc.content
              ELSE NULL
          END AS last_message
      FROM
          Notification n
      LEFT JOIN
          Board b ON n.board_id = b.board_id
      LEFT JOIN
          ChatRoom cr ON n.chatroom_id = cr.chatroom_id
      LEFT JOIN
          GroupChatRoom gc ON n.group_chatroom_id = gc.group_chatroom_id
      WHERE
          n.user_id = ?;
  `;

  connection.query(query, [user_id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No notifications found' });
    }

    res.status(200).json(results);
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

// 알림 읽음 상태 API
router.put('/:notification_id/read', (req, res) => {
  const { notification_id } = req.params;
  const query = 'UPDATE Notification SET is_read = 1 WHERE notification_id = ?';

  connection.query(query, [notification_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read' });
  });
});


  module.exports = router;
