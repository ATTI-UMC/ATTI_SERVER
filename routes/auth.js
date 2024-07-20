const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );
 
  //카카오 로그인
router.get('/kakao',
    passport.authenticate('kakao')
);

router.get('/kakao/callback', 
    passport.authenticate('kakao', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/profile');
    }
);


module.exports = router;
