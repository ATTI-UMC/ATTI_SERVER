const connection = require('../config/db');

const createChatRoom = async (userId, title, interest_tags) => {
  const query = `
      INSERT INTO ChatRoom (user_id, title, interest_tags)
      VALUES (?, ?, ?)
  `;
  const [results] = await connection.query(query, [userId, title, interest_tags]);
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

const getMBTIPercentage = async (mbti1, mbti2) => {
  const query = `
    SELECT percentage 
    FROM MBTI_Percentage 
    WHERE 
      (MBTI_1 = (SELECT MBTI_ID FROM MBTI WHERE type = ?) 
       AND MBTI_2 = (SELECT MBTI_ID FROM MBTI WHERE type = ?))
      OR 
      (MBTI_1 = (SELECT MBTI_ID FROM MBTI WHERE type = ?) 
       AND MBTI_2 = (SELECT MBTI_ID FROM MBTI WHERE type = ?))
  `;
  const [results] = await connection.query(query, [mbti1, mbti2, mbti2, mbti1]);
  return results.length > 0 ? results[0].percentage : null;
};

const getChatRooms = async () => {
  const query = `
      SELECT c.chatroom_id, c.title, c.interest_tags, u.nickname, u.MBTI_FK
      FROM ChatRoom c
      JOIN User u ON c.user_id = u.userid
  `;
  const [results] = await connection.query(query);
  return results;
};

const getPotentialMatches = async (userMbti) => {
  const query = `
      SELECT u.userid, u.nickname, u.MBTI_FK, m.percentage
      FROM User u
      JOIN MBTI_Percentage m ON (m.MBTI_1 = (SELECT MBTI_ID FROM MBTI WHERE type = ?) 
      AND m.MBTI_2 = (SELECT MBTI_ID FROM MBTI WHERE type = u.MBTI_FK))
      OR (m.MBTI_2 = (SELECT MBTI_ID FROM MBTI WHERE type = ?) 
      AND m.MBTI_1 = (SELECT MBTI_ID FROM MBTI WHERE type = u.MBTI_FK))
      ORDER BY m.percentage DESC;
  `;
  const [results] = await connection.query(query, [userMbti, userMbti]);
  return results;
};

const getChatRoomsByUser = async (userId) => {
  const query = `
      SELECT c.chatroom_id, c.title, c.interest_tags, u.nickname, u.MBTI_FK
      FROM ChatRoom c
      JOIN User u ON c.user_id = u.userid
      WHERE c.user_id = ?
  `;
  const [results] = await connection.query(query, [userId]);
  return results;
};

// 특정 해시태그를 포함하는 채팅방 목록을 조회
const getChatRoomsByTags = async (interestTags) => {
  const query = `
      SELECT c.chatroom_id, c.title, c.interest_tags, u.nickname, u.MBTI_FK
      FROM ChatRoom c
      JOIN User u ON c.user_id = u.userid
      WHERE FIND_IN_SET(?, c.interest_tags)
  `;
  const [results] = await connection.query(query, [interestTags]);
  return results;
};


module.exports = {
  getMBTIPercentage,
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  deleteMessage,
  updateChatLog,
  getPotentialMatches,
  getChatRooms,
  getChatRoomsByUser,
  getChatRoomsByTags,
  updateMBTIPercentage
};