const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./config/passport');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const ocrRouter = require('./routes/ocr');
const userRouter= require('./routes/user');
const crypto = require('crypto');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./config/swagger.config');
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 세션 설정, 시크릿키는 crypto 메소드로 생성합니다.
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

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우트 설정
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/ocr', ocrRouter);
app.use('/user',userRouter);


app.get('/oauth/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/profile');
    }
);


// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
