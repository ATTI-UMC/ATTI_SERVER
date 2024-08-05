const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy; // 수정된 부분
const NaverStrategy = require('passport-naver').Strategy;
const mysql = require('mysql2');

// MySQL 연결 풀 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

function configurePassport() {
  const strategyCallback = (provider) => {
    return async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await pool.promise().query('SELECT * FROM User WHERE id = ? AND provider = ?', [profile.id, provider]);

        if (rows.length === 0) {
          // 새 사용자 생성
          const [maxUserIdResult] = await pool.promise().query('SELECT MAX(userid) AS maxUserid FROM User');
          const maxUserid = parseInt(maxUserIdResult[0].maxUserid, 10) || 0;
          const newUserid = maxUserid + 1;

          let nickname;
          if (provider === 'naver') {
            nickname = profile._json.nickname;
          } else {
            nickname = profile.displayName; // Google의 경우 이름을 닉네임으로 설정
          }

          const defaultMBTI = 'IIII';
          await pool.promise().query(
            'INSERT INTO User (userid, id, nickname, name, MBTI_FK, provider) VALUES (?, ?, ?, ?, ?, ?)',
            [newUserid, profile.id, nickname, profile.displayName, defaultMBTI, provider]
          );

          const newUser = {
            userid: newUserid,
            id: profile.id,
            nickname: nickname,
            name: profile.displayName,
            MBTI_FK: defaultMBTI,
            provider: provider,
          };
          return done(null, newUser);
        } else {
          return done(null, rows[0]);
        }
      } catch (error) {
        console.error('Error in passport strategy:', error);
        return done(error);
      }
    };
  };

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, strategyCallback('google')));

  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CALLBACK_URL,
  }, strategyCallback('naver')));

  passport.serializeUser((user, done) => {
    done(null, user.userid);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const [rows] = await pool.promise().query('SELECT * FROM User WHERE userid = ?', [id]);
      done(null, rows[0]);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      done(error);
    }
  });
}

module.exports = configurePassport;
