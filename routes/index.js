const mysql = require('mysql'); 
const express = require('express');
const {addUserInfo}=require('../models/adduser');
const router = express.Router();

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
router.get('/', (req, res) => {
  res.send(`
    <a href="/auth/google">Login with Google</a><br>
    <a href="/auth/naver">Login with Naver</a>
  `);
});

router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  if (req.user.MBTI_FK === 'IIII') {
    // MBTI 값이 "IIII"인 경우 입력 폼을 보여줌
    res.send(`
      안녕하세요, ${req.user.name}님!<br>
      현재 MBTI가 설정되지 않았습니다. 아래 폼에 MBTI를 입력해주세요.<br>
      <form action="/profile/mbti" method="POST">
        <label for="mbti">MBTI:</label>
        <input type="text" id="mbti" name="mbti" required>
        <button type="submit">저장</button>
      </form>
    `);
  } else if (!req.user.nickname||!req.user.age || !req.user.school || !req.user.department || !req.user.interest_tags || !req.user.status || !req.user.student_id) {
    // 추가 정보가 누락된 경우 추가 정보 입력 폼을 보여줍니다.
    res.send(`
      안녕하세요, ${req.user.name}님!<br>
      추가 정보가 필요합니다. 정보를 입력해주세요.<br>
      <form action="/profile/complete" method="POST">
        <label for="nickname">닉네임:</label>
        <input type="text" id="nickname" name="nickname"><br>
        <label for="age">나이:</label>
        <input type="number" id="age" name="age"><br>
        <label for="school">학교:</label>
        <input type="text" id="school" name="school"><br>
        <label for="department">학과:</label>
        <input type="text" id="department" name="department"><br>
        <label for="interest_tags">관심사:</label>
        <input type="text" id="interest_tags" name="interest_tags"><br>
        <label for="status">재학 상태:</label>
        <input type="text" id="status" name="status"><br>
        <label for="student_id">학번:</label>
        <input type="text" id="student_id" name="student_id"><br>
        <button type="submit">저장</button>
      </form>
    `);
  } else {
    // MBTI 값과 추가 정보가 모두 설정된 경우 사용자 정보를 보여줍니다.
    res.send(`
      안녕하세요, ${req.user.name}님!<br>
      닉네임: ${req.user.nickname || '정보 없음'}<br>
      MBTI: ${req.user.MBTI_FK}<br>
      나이: ${req.user.age || '정보 없음'}<br>
      학교: ${req.user.school || '정보 없음'}<br>
      학과: ${req.user.department || '정보 없음'}<br>
      관심사: ${req.user.interest_tags || '정보 없음'}<br>
      재학 상태: ${req.user.status || '정보 없음'}<br>
      학번: ${req.user.student_id || '정보 없음'}
    `);
  }
});
// ->  json으로 바꿔야 함.

router.post('/profile/complete', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const { nickname,age, school, department, interest_tags, status, student_id } = req.body;
  const userId = req.user.id;

  try {
    // 사용자 정보 업데이트
    await addUserInfo(userId, {
      nickname: nickname||null,
      age: age || null,
      school: school || null,
      department: department || null,
      interest_tags: interest_tags || null,
      status: status || null,
      student_id: student_id || null
    });

    // 성공적으로 업데이트된 후 프로필 페이지로 리디렉션
    res.redirect('/profile');
  } catch (error) {
    console.error('정보 저장 중 오류 발생:', error);
    res.redirect('/profile');
  }
});

router.post('/profile/mbti', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  const mbti = req.body.mbti;
  const userId = req.user.userid;

  // 사용자 MBTI 업데이트
  const updateQuery = 'UPDATE User SET MBTI_FK = ? WHERE userid = ?';
  connection.query(updateQuery, [mbti, userId], (err) => {
    if (err) {
      console.error('Error updating MBTI:', err);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      // 업데이트 후 사용자 정보를 다시 조회하여 세션 갱신 -> 중요, 저희 백엔드는 세션기반이라 세션 갱신 해줘야 해요
      const selectQuery = 'SELECT * FROM User WHERE userid = ?';
      connection.query(selectQuery, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching user data:', err);
          res.status(500).json({ error: 'An error occurred' });
        } else {
          req.login(results[0], (err) => {
            if (err) {
              console.error('Error logging in user:', err);
              res.status(500).json({ error: 'An error occurred' });
            } else {
              res.redirect('/profile');
            }
          });
        }
      });
    }
  });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// 사용자 정보 가져오기 API
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // MySQL 쿼리 작성
  const query = 'SELECT * FROM User WHERE userid = ?';

  // 데이터베이스에서 사용자 정보 조회
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).json({ error: 'An error occurred' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json(results[0]);
    }
  });
});

module.exports = router;
