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
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  if (req.user.MBTI_FK === 'IIII') {
    // MBTI 값이 "IIII"인 경우 MBTI 입력이 필요함을 알림
    res.json({
      message: `안녕하세요, ${req.user.name}님! 현재 MBTI가 설정되지 않았습니다.`,
      requiredAction: {
        action: "inputMBTI",
        method: "POST",
        fields: {
          mbti: {
            type: "string",
            required: true
          }
        }
      }
    });
  } else if (!req.user.nickname || !req.user.age || !req.user.school || !req.user.department || !req.user.interest_tags || !req.user.status || !req.user.student_id) {
    // 추가 정보가 누락된 경우 추가 정보 입력이 필요함을 알림
    res.json({
      message: `안녕하세요, ${req.user.name}님! 추가 정보가 필요합니다.`,
      requiredAction: {
        action: "completeProfile",
        method: "POST",
        fields: {
          nickname: { type: "string", required: false },
          age: { type: "number", required: false },
          school: { type: "string", required: false },
          department: { type: "string", required: false },
          interest_tags: { type: "string", required: false },
          status: { type: "string", required: false },
          student_id: { type: "string", required: false }
        }
      }
    });
  } else {
    // MBTI 값과 추가 정보가 모두 설정된 경우 사용자 정보를 JSON으로 응답
    res.json({
      message: `안녕하세요, ${req.user.name}님!`,
      profile: {
        nickname: req.user.nickname || '정보 없음',
        MBTI: req.user.MBTI_FK,
        age: req.user.age || '정보 없음',
        school: req.user.school || '정보 없음',
        department: req.user.department || '정보 없음',
        interest_tags: req.user.interest_tags || '정보 없음',
        status: req.user.status || '정보 없음',
        student_id: req.user.student_id || '정보 없음'
      }
    });
  }
});

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
