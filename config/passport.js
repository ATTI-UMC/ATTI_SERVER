const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mysql = require('mysql');

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

function configurePassport() {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
      const query = 'SELECT * FROM User WHERE userid = ?';
      connection.query(query, [profile.id], (err, results) => {
        if (err) {
          return done(err);
        }
        if (results.length === 0) {
          // 사용자 정보가 없으면 기본값으로 삽입
          const nickname = profile.displayName.slice(0, 5);
          const defaultMBTI = 'ESTJ'; // 기본 MBTI 값
          const insertQuery = 'INSERT INTO User (userid, id, nickname, name, MBTI_FK) VALUES (?, ?, ?, ?, ?)';
          connection.query(insertQuery, [profile.id, profile.id, nickname, profile.displayName, defaultMBTI], (err) => {
            if (err) {
              return done(err);
            }
            return done(null, { ...profile, isNewUser: true });
          });
        } else {
          return done(null, results[0]);
        }
      });
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

module.exports = configurePassport;
