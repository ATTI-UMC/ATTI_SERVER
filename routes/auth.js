const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { addUserInfo, findUserById, verifyPassword } = require('../models/adduser'); 
const router = express.Router();

// Google 로그인
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  handleAuthCallback
);

// Naver 로그인
router.get('/naver', passport.authenticate('naver', { scope: ['profile','email'] }));

router.get('/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/login' }),
  handleAuthCallback
);

router.post('/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await findUserById(id); 
    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isValidPassword = await verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '비밀번호가 잘못되었습니다.' });
    }

    req.login(user, (err) => {
      if (err) {
        console.error('로그인 중 오류:', err);
        return res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
      }
      res.json({ message: '로그인 성공', user });
    });
  } catch (error) {
    console.error('서버 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회원가입 라우트
router.post('/register', async (req, res) => {
  const { id, password } = req.body;

  try {
    // ID 중복 확인
    const existingUser = await findUserById(id); 
    if (existingUser) {
      return res.status(409).json({ message: 'ID가 이미 사용 중입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
    await addUserInfo({
      id,
      password: hashedPassword,
      MBTI_FK: 'IIII', // 기본 MBTI 설정
      provider: 'plain' // 일반 로그인으로 설정
    });

    res.json({ message: '회원가입 성공' });
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

function handleAuthCallback(req, res) {
  console.log(`${req.user.provider} 로그인 성공`);
  res.redirect('/profile');
}

// 인증된 사용자인지 확인하는 미들웨어  
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

module.exports = router;
module.exports.checkAuthenticated = checkAuthenticated;
