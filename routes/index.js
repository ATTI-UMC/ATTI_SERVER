const mysql = require('mysql'); 
const express = require('express');
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
  res.send('<a href="/auth/google">Login with Google</a>');
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
  } else {
    // MBTI 값이 설정된 경우 사용자 정보를 보여줌
    res.send(`안녕하세요, ${req.user.name}님!<br>MBTI: ${req.user.MBTI_FK}`);
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
