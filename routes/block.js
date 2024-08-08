const express = require('express');
const router = express.Router();
const mysql = require ('mysql');
const passport = require('passport');

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 차단 사용자 생성 API
router.post('/', (req, res) => {
    const { user_id, block_id } = req.body;
    const query = 'INSERT INTO Block (user_id, block_id) VALUES (?, ?)';
    connection.query(query, [user_id, block_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ block_id: result.insertId });
        }
    });
  });
  

// 차단 목록에서 사용자 삭제
router.delete('/', (req, res) => {
    const { user_id, block_id } = req.body;

    const query = 'DELETE FROM Block WHERE user_id = ? AND block_id = ?';

    connection.query(query, [user_id, block_id], (error, results) => {
        if (error) {
            console.error('Error unblocking user:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.send('User unblocked successfully');
    });
});

// 차단된 사용자 목록 조회 -> ok
router.get('/:user_id', (req, res) => {
    const {user_id} = req.params;  // 현재 로그인된 사용자

    const query = 'SELECT block_id FROM Block WHERE user_id = ?';

    connection.query(query, [user_id], (error, results) => {
        if (error) {
            console.error('Error fetching blocked users:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

module.exports = router;
