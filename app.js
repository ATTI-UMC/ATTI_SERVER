require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth'); 

const ocrRouter = require('./routes/ocr');
const userRouter = require('./routes/user');

const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./swagger/swagger.config');
const configurePassport = require('./config/passport');
const bodyParser = require('body-parser');
const groupChatRouter = require('./routes/groupChat');
const joinRouter = require('./routes/join');
const blockRouter= require ('./routes/block');
const notificationRouter=require ('./routes/notifications');
const flash = require('connect-flash'); 
const commentRouter = require('./routes/comments'); 
const commentActionsRouter = require('./routes/commentActions'); 
const commentLikesRouter = require('./routes/commentLikes'); 
const chatRouter = require('./routes/chat'); 
const app = express();
const boardRouter = require('./routes/board');

app.use(flash()); 
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
    sameSite: 'lax',
  },
}));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

//스웨거
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/ocr', ocrRouter);
app.use('/user', userRouter);
app.use('/board', boardRouter);
app.use('/groupchat', groupChatRouter);
app.use('/join',joinRouter);
app.use('/block',blockRouter);
app.use('/notifications',notificationRouter);
app.use('/chat', chatRouter);

app.use('/comments', commentRouter); 
app.use('/commentActions', commentActionsRouter); 
app.use('/commentLikes', commentLikesRouter); 

app.get('/oauth/google',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;