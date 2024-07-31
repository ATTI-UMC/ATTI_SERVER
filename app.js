require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');

const { router: indexRouter } = require('./routes/index'); // index 라우터 가져오기
const { router: authRouter } = require('./routes/auth'); // auth 라우터 가져오기

const boardRouter = require('./routes/board'); //게시물

const ocrRouter = require('./routes/ocr');
const userRouter = require('./routes/user');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./swagger/swagger.config.js');
const configurePassport = require('./config/passport');
const flash = require('connect-flash'); //flahg-알림 기능
const commentRouter = require('./routes/comments'); // 댓글 라우터 추가
const commentActionsRouter = require('./routes/commentActions'); // 댓글 수정 및 삭제 라우터 추가
const commentLikesRouter = require('./routes/commentLikes'); // 좋아요 기능 라우터 추가


const app = express();

app.use(flash()); // 플래시 메시지 미들웨어 추가

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const secret = crypto.randomBytes(64).toString('hex');
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'  
    }
}));



configurePassport();
app.use(passport.initialize());
app.use(passport.session());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/ocr', ocrRouter);
app.use('/user', userRouter);
app.use('/comments', commentRouter); // 댓글 라우터 추가
app.use('/commentActions', commentActionsRouter); // 댓글 수정 및 삭제 라우터 추가
app.use('/commentLikes', commentLikesRouter); // 좋아요 기능 라우터 추가
app.use('/board', boardRouter); // 게시물 라우터 추가


app.get('/oauth/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );
// 서버 실행
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = app;