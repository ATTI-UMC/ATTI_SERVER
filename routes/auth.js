
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT 토큰 생성 함수
const createJwtToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Google 로그인
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Google 로그인 성공');
    
    // 사용자 ID만 토큰에 포함
    const token = createJwtToken(req.user.id);
    
    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    console.log('JWT 토큰 생성 및 쿠키 설정');
    
    res.redirect('/profile');
  }
);

module.exports = router;
