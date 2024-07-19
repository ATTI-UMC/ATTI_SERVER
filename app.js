
const express = require('express');
const session = require('express-session');
const passport = require('passport'); // passport 모듈을 추가
const passportConfig = require('./config/passport');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const crypto = require('crypto');


const app = express();

// 세션 설정, 시크릿키는 javascript내부 메소드로 구현했습니다.
const secret = crypto.randomBytes(64).toString('hex');
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));

// Passport 초기화
passportConfig();
app.use(passport.initialize());
app.use(passport.session());

// 라우트 설정
app.use('/', indexRouter);
app.use('/auth', authRouter);


app.get('/oauth/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

  // Kakao OAuth 라우트 설정
app.get('/oauth/kakao',
  passport.authenticate('kakao', { failureRedirect: '/login' }), 
  (req, res) => {
      res.redirect('/profile'); 
  }
);

// 서버 실행
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
