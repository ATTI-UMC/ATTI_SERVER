require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const jwt = require('jsonwebtoken');

module.exports = function() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    (token, tokenSecret, profile, done) => {
        const jwtToken = jwt.sign(profile, process.env.JWT_SECRET, { expiresIn: '1h' });
        return done(null, { profile, token: jwtToken });
    }));

    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: process.env.KAKAO_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
        const jwtToken = jwt.sign(profile, process.env.JWT_SECRET, { expiresIn: '1h' });
        return done(null, { profile, token: jwtToken });
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
};
