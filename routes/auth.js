const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google 로그인
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.login(req.user, (err) => {
            if (err) {
                return next(err);
            }
            const token = jwt.sign(
                { id: req.user.id, displayName: req.user.displayName }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );
            res.redirect(`/profile?token=${token}`);
        });
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