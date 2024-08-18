const mysql = require('mysql2');
const bcrypt = require('bcrypt');


// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Promise 기반 연결
const PromiseConnection = connection.promise();

// 사용자 정보 업데이트 함수
async function addUserInfo(userInfo) {
  if (!userInfo) {
    throw new Error('userInfo는 null일 수 없습니다.');
  }

  const { id, password, MBTI_FK } = userInfo;

  try {
    // 현재 최대 userid 조회
    const [maxIdResult] = await PromiseConnection.query(
      `SELECT MAX(userid) AS maxUserid FROM User`
    );

    // 최대 userid에서 1 증가
    const newUserId = (maxIdResult[0].maxUserid || 0) + 1;

    // 사용자 추가
    const [result] = await PromiseConnection.query(
      `INSERT INTO User (userid, id, nickname, name,password, MBTI_FK, provider) VALUES (?, ?,?, ?, ?, ?, ?)`,
      [newUserId, id, id, id,password, MBTI_FK, 'plain'] // nickname을 id와 동일하게 설정
    );

    return result; // 삽입된 결과 반환
  } catch (error) {
    console.error('Error adding user info:', error);
    throw error;
  }
}
// 사용자 정보 업데이트 함수
async function updateUserInfo(userId, updateFields) {
  if (!userId || !updateFields) {
    throw new Error('userId와 updateFields는 null일 수 없습니다.');
  }

  const fields = Object.keys(updateFields);
  const values = Object.values(updateFields);

  try {
    // 동적으로 업데이트 쿼리 생성
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE User SET ${setClause} WHERE userid = ?`;

    // 사용자 정보 업데이트
    const [result] = await PromiseConnection.query(query, [...values, userId]);

    return result; // 업데이트 결과 반환
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
}


const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM User WHERE id = ?';
    connection.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// 비밀번호 확인 함수
const verifyPassword = (user, password) => {
  return bcrypt.compare(password, user.password);
};


module.exports = { addUserInfo,findUserById, verifyPassword,updateUserInfo};
