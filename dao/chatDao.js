const connection = require('../config/db');

const createChatRoom = async (userId, content) => {
  const query = 'INSERT INTO ChatRoom (user_id, content) VALUES (?, ?)';
  const [results] = await connection.query(query, [userId, content]);
  return results.insertId;
};

const getMessages = async (chatroomId) => {
  const query = 'SELECT * FROM ChatMessage WHERE chatroom_id = ?';
  const [results] = await connection.query(query, [chatroomId]);
  return results;
};

const createMessage = async (chatroomId, userId, content) => {
  const query = 'INSERT INTO ChatMessage (chatroom_id, user_id, content) VALUES (?, ?, ?)';
  const [results] = await connection.query(query, [chatroomId, userId, content]);
  return results.insertId;
};

const deleteChatRoom = async (chatroomId) => {
  const query = 'DELETE FROM ChatRoom WHERE chatroom_id = ?';
  await connection.query(query, [chatroomId]);
};

const deleteMessage = async (messageId) => {
  const query = 'DELETE FROM ChatMessage WHERE message_id = ?';
  await connection.query(query, [messageId]);
};

const updateChatLog = async (chatroomId, userId) => {
  const logQuery = 'SELECT * FROM ChatLog WHERE chatroom_id = ?';
  const [logs] = await connection.query(logQuery, [chatroomId]);

  if (logs.length === 0) {
    // 새로운 채팅 로그 생성
    const insertLogQuery = `
      INSERT INTO ChatLog (chatroom_id, user1_id, user2_id, user1_mbti, user2_mbti, message_count)
      VALUES (?, ?, ?, (SELECT MBTI_FK FROM User WHERE userid = ?), (SELECT MBTI_FK FROM User WHERE userid = ?), 1)
    `;
    await connection.query(insertLogQuery, [chatroomId, userId, userId, userId, userId]);
  } else {
    const updateLogQuery = `
      UPDATE ChatLog SET message_count = message_count + 1 WHERE chatroom_id = ?
    `;
    await connection.query(updateLogQuery, [chatroomId]);
  }
};

const updateMBTIPercentage = async () => {
  const logsQuery = 'SELECT * FROM ChatLog';
  const [logs] = await connection.query(logsQuery);

  for (const log of logs) {
    const previousMessageCount = log.message_count;
    const currentMessageCount = log.message_count; // 예시로 현재 메시지 수는 바로 이전과 같다고 가정
    
    const changeRatio = ((currentMessageCount - previousMessageCount) / previousMessageCount) * 100;
    let percentageChange = 0;

    if (changeRatio >= 40) {
      percentageChange = 3;
    } else if (changeRatio >= 30) {
      percentageChange = 2;
    } else if (changeRatio >= 20) {
      percentageChange = 1;
    } else if (changeRatio <= -40) {
      percentageChange = -3;
    } else if (changeRatio <= -30) {
      percentageChange = -2;
    } else if (changeRatio <= -20) {
      percentageChange = -1;
    }

    if (Math.abs(changeRatio) >= 10) {
      const updatePercentageQuery = `
        UPDATE MBTI_Percentage
        SET percentage = LEAST(100, GREATEST(0, percentage + ?))
        WHERE MBTI_1 = ? AND MBTI_2 = ?
      `;
      await connection.query(updatePercentageQuery, [percentageChange, log.user1_mbti, log.user2_mbti]);
    }
  }
};

module.exports = {
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  deleteMessage,
  updateChatLog,
  updateMBTIPercentage
};
