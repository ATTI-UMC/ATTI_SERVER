const express = require('express');

// 알림 생성 API
router.post('/notifications', (req, res) => {
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
  router.get('/notifications/:user_id', (req, res) => {
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
  module.exports = router;
