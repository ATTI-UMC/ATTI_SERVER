const mysql = require('mysql2');

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
async function addUserInfo(userId, userInfo) {
  try {
    const [rows] = await PromiseConnection.query(
      `UPDATE User SET
         age = ?, 
         school = ?, 
         department = ?, 
         interest_tags = ?, 
         status = ?, 
         student_id = ?
       WHERE id = ?`,
      [
        userInfo.age || null,
        userInfo.school || null,
        userInfo.department || null,
        userInfo.interest_tags || null,
        userInfo.status || null,
        userInfo.student_id || null,
        userId
      ]
    );
    return rows;
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
}

module.exports = { addUserInfo };
