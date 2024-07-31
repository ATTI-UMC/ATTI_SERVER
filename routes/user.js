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

/**
 * @swagger
 * /user/mbti:
 *   get:
 *     summary: MBTI 입력 폼 제공
 *     description: 로그인한 사용자에게 MBTI 입력 폼을 제공합니다.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: MBTI 입력 폼 HTML
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/mbti', (req, res) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).send('Unauthorized');
  }

  res.send(`
    <form action="/user/mbti" method="POST">
      <label for="mbti">Enter your MBTI:</label>
      <input type="text" id="mbti" name="mbti" required>
      <button type="submit">Submit</button>
    </form>
  `);
}); //이거 json으로 바꿔야 하고

/**
 * @swagger
 * /user/mbti:
 *   post:
 *     summary: MBTI 정보 저장
 *     description: 사용자의 MBTI 정보를 데이터베이스에 저장합니다.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               mbti:
 *                 type: string
 *                 description: 사용자의 MBTI
 *             required:
 *               - mbti
 *     responses:
 *       302:
 *         description: 프로필 페이지로 리다이렉트
 *       401:
 *         description: 인증되지 않은 사용자
 *       500:
 *         description: 서버 오류
 */
router.post('/mbti', (req, res) => {
  const { mbti } = req.body;
  const user = req.session.passport.user;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  const nickname = user.id.slice(0, 5);
  const query = 'INSERT INTO User (userid, id, nickname, name) VALUES (?, ?, ?, ?)';
  connection.query(query, [user.id, user.id, nickname, user.name], (err) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).send('An error occurred');
    }
    res.redirect('/profile');
  });
});

module.exports = router;