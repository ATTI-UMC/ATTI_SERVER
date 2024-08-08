const express = require('express');
const router = express.Router();
const mysql = require('mysql');
require('dotenv').config();

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

/**
 * @swagger
 * /board:
 *   get:
 *     summary: Retrieve all posts
 *     description: Retrieve a list of all posts from the board.
 *     responses:
 *       200:
 *         description: A list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   board_id:
 *                     type: integer
 *                     description: The post ID.
 *                   user_id:
 *                     type: integer
 *                     description: The ID of the user who created the post.
 *                   content:
 *                     type: string
 *                     description: The content of the post.
 *                   likes:
 *                     type: integer
 *                     description: The number of likes the post has.
 */

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
/**
 * @swagger
 * /board/{id}:
 *   get:
 *     summary: Retrieve a specific post
 *     description: Retrieve a specific post by ID from the board.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: truende
 *         description: The ID of the post to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A post object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 board_id:
 *                   type: integer
 *                   description: The post ID.
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user who created the post.
 *                 content:
 *                   type: string
 *                   description: The content of the post.
 *                 likes:
 *                   type: integer
 *                   description: The number of likes the post has.
 *                 username:
 *                   type: string
 *                   description: The username of the user who created the post.
 *       404:
 *         description: Post not found.
 */

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

/**
 * @swagger
 * /board/{id}:
 *   put:
 *     summary: Update a specific post
 *     description: Update the content and likes of a specific post by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: The new content and likes for the post.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               likes:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Post successfully updated.
 *       404:
 *         description: Post not found.
 */

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

/**
 * @swagger
 * /board/{id}:
 *   delete:
 *     summary: Delete a specific post
 *     description: Delete a specific post by ID from the board.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post successfully deleted.
 *       404:
 *         description: Post not found.
 */

module.exports = router;