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


// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});


//모든 게시글 조회 라우터
router.get('/', (req, res) => {
  const query = 'SELECT * FROM board';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    res.json(results);
  });
});

//특정 게시글 조회 라우터
router.get('/:id', (req, res) => {
  const postId = req.params.id; 
  const query = `
    SELECT 
      board.board_id, 
      board.user_id, 
      board.content, 
      board.likes, 
      user.username 
    FROM 
      board 
    LEFT JOIN 
      user 
    ON 
      board.user_id = user.userid 
    WHERE 
      board.board_id = ?`;

  connection.query(query, [postId], (err, results) => {
    if (err) {
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('게시글을 찾을 수 없습니다.');
      return;
    }

    res.json(results[0]);
  });
});

// 게시글 수정 라우터
router.put('/:id', (req, res) => {
  const postId = req.params.id;
  const { content, likes } = req.body;
  const query = 'UPDATE board SET content = ?, likes = ? WHERE board_id = ?';

  connection.query(query, [content, likes, postId], (err, results) => {
    if (err) {
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send('게시글을 찾을 수 없습니다.');
      return;
    }

    res.status(200).send('게시글이 성공적으로 수정되었습니다.');
  });
});

// 게시글 삭제 라우터
router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  const query = 'DELETE FROM board WHERE board_id = ?';

  connection.query(query, [postId], (err, results) => {
    if (err) {
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send('게시글을 찾을 수 없습니다.');
      return;
    }

    res.status(200).send('게시글이 성공적으로 삭제되었습니다.');
  });
});

module.exports = router;