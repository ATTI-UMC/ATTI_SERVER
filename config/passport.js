const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mysql = require('mysql');
//로그인 관련 설정 Config
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
      const query = 'SELECT * FROM User WHERE id = ?';
      connection.query(query, [profile.id], (err, results) => {
        if (err) {
          return done(err);
        }
        if (results.length === 0) {
          // 사용자 정보가 없으면 새로운 userid 할당
          const getMaxUserIdQuery = 'SELECT MAX(userid) AS maxUserid FROM User';
          connection.query(getMaxUserIdQuery, (err, results) => {
            if (err) {
              return done(err);
            }
              // maxUserid가 숫자인지 확인하고, 숫자가 아니면 기본값으로 0을 사용
            const maxUserid = parseInt(results[0].maxUserid, 10) || 0;
            const newUserid = maxUserid + 1;


            const nickname = profile.displayName;
            const defaultMBTI = 'IIII'; // 기본 MBTI 값
            const insertQuery = 'INSERT INTO User (userid, id, nickname, name, MBTI_FK) VALUES (?, ?, ?, ?, ?)';
            connection.query(insertQuery, [newUserid, profile.id, nickname, profile.displayName, defaultMBTI], (err) => {
              if (err) {
                return done(err);
              }
              const newUser = {
                userid: newUserid,
                id: profile.id,
                nickname: nickname,
                name: profile.displayName,
                MBTI_FK: defaultMBTI
              };
              return done(null, newUser);
            });
          });
        } else {
          return done(null, results[0]);
        }
      });
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.userid);
  });

  passport.deserializeUser((id, done) => {
    const query = 'SELECT * FROM User WHERE userid = ?';
    connection.query(query, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      done(null, results[0]);
    });
  });
}

module.exports = configurePassport;