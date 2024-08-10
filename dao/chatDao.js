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

module.exports = {
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  deleteMessage
};
