const express = require('express');
const passport = require('passport');
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