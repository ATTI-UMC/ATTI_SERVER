require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const configurePassport = require('./config/passport');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const ocrRouter = require('./routes/ocr');
const userRouter = require('./routes/user');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./config/swagger.config');

const app = express();


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

app.get('/oauth/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/profile');
    }
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
``
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;