const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/adduser'); // 데이터베이스 모델을 가져옵니다.

// JWT 토큰 생성 함수
const createJwtToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Google 로그인
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google 로그인 콜백
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }

    console.log('Google 로그인 성공');
    
    // 사용자 정보 조회
    const user = await User.findById(req.user.id);
    
    // 추가 정보가 부족한 경우에만 추가 정보 입력 페이지로 리다이렉트
    if (!user.age || !user.school || !user.department || !user.interest_tags || !user.status || !user.student_id) {
      res.redirect('/complete-profile');
    } else {
      // JWT 토큰 생성 및 쿠키 설정
      const token = createJwtToken(user.id);
      res.cookie('jwt', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24시간
      });

      console.log('JWT 토큰 생성 및 쿠키 설정');
      res.redirect('/profile');
    }
  }
);

// 추가 정보 입력 페이지
router.get('/complete-profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  res.send(`
    <form action="/complete-profile" method="POST">
      <label for="age">Age:</label>
      <input type="number" id="age" name="age"><br>
      
      <label for="school">School:</label>
      <input type="text" id="school" name="school"><br>
      
      <label for="mbti">MBTI:</label>
      <input type="text" id="mbti" name="mbti"><br>
      
      <label for="department">Department:</label>
      <input type="text" id="department" name="department"><br>
      
      <label for="interest_tags">Interest Tags:</label>
      <input type="text" id="interest_tags" name="interest_tags"><br>
      
      <label for="status">Status:</label>
      <input type="text" id="status" name="status"><br>
      
      <label for="student_id">Student ID:</label>
      <input type="text" id="student_id" name="student_id"><br>
      
      <button type="submit">Submit</button>
    </form>
  `);
});

// 추가 정보 제출 처리
router.post('/complete-profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  const { age, school, mbti, department, interest_tags, status, student_id } = req.body;
  const userId = req.user.id;

  try {
    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(userId, {
      age,
      school,
      MBTI_FK: mbti,
      department,
      interest_tags,
      status,
      student_id
    });

    // JWT 토큰 생성 및 쿠키 설정
    const token = createJwtToken(userId);
    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    console.log('추가 정보 저장 및 JWT 토큰 생성');

    res.redirect('/profile');
  } catch (error) {
    console.error('정보 저장 중 오류 발생:', error);
    res.redirect('/complete-profile');
  }
});

module.exports = router;
