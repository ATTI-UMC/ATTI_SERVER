const mysql = require('mysql'); 
const express = require('express');
const { addUserInfo ,updateUserInfo} = require('../models/adduser');
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

// 사용자 프로필 가져오기
router.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  // 닉네임, 나이, 학교 정보만 JSON으로 응답
  res.json({
    message: `안녕하세요, ${req.user.name}님!`,
    profile: {
      nickname: req.user.nickname || '정보 없음',
      age: req.user.age || '정보 없음',
      school: req.user.school || '정보 없음'
    }
  });
});

// 사용자 정보 업데이트 - Step 1
router.post('/complete/step1', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const { nickname, age, gender } = req.body;
  const userId = req.user.userid;

  try {
    // 사용자 정보 업데이트
    await updateUserInfo(userId, {
      nickname: nickname || null,
      age: age || null,
      gender: gender || null,
    });
    // 성공적으로 업데이트된 후 JSON 응답
    res.json({ message: '사용자 정보가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('정보 저장 중 오류 발생:', error);
    res.status(500).json({ message: '정보 저장 중 오류가 발생했습니다.' });
  }
});
// 사용자 정보 업데이트 - Step 2
router.post('/complete/step2', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const { is_student, introduce } = req.body;
  const userId = req.user.userid;

  try {
    // 재학생 여부와 한줄소개 업데이트
    await updateUserInfo(userId, {
      is_student: is_student === 'true', // boolean 처리
      introduce: introduce || null,
    });

    // 성공적으로 업데이트된 후 JSON 응답
    res.json({ message: '사용자 정보가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('정보 저장 중 오류 발생:', error);
    res.status(500).json({ message: '정보 저장 중 오류가 발생했습니다.' });
  }
});

// 사용자 MBTI 업데이트
router.post('/mbti', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const mbti = req.body.mbti;
  const userId = req.user.userid;

  // 사용자 MBTI 업데이트
  const updateQuery = 'UPDATE User SET MBTI_FK = ? WHERE userid = ?';
  connection.query(updateQuery, [mbti, userId], (err) => {
    if (err) {
      console.error('Error updating MBTI:', err);
      return res.status(500).json({ error: 'An error occurred' });
    } else {
      // 업데이트 후 사용자 정보를 다시 조회하여 세션 갱신
      const selectQuery = 'SELECT * FROM User WHERE userid = ?';
      connection.query(selectQuery, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching user data:', err);
          return res.status(500).json({ error: 'An error occurred' });
        } else {
          req.login(results[0], (err) => {
            if (err) {
              console.error('Error logging in user:', err);
              return res.status(500).json({ error: 'An error occurred' });
            } else {
              res.json({ message: 'MBTI 정보가 성공적으로 업데이트되었습니다.' });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
