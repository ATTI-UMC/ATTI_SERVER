const chatDao = require('../dao/chatDao');


const createChatRoom = async (userId, title, interest_tags) => {
  return await chatDao.createChatRoom(userId, title, interest_tags);
};

const getMessages = async (chatroomId) => {
  return await chatDao.getMessages(chatroomId);
};

const createMessage = async (chatroomId, userId, content) => {
  return await chatDao.createMessage(chatroomId, userId, content);

  await chatDao.updateChatLog(chatroomId, userId);
  
  return messageId;
};

const deleteChatRoom = async (chatroomId) => {
  await chatDao.deleteChatRoom(chatroomId);
};

const deleteMessage = async (messageId) => {
  await chatDao.deleteMessage(messageId);
};

const updateMBTIPercentage = async () => {
  await chatDao.updateMBTIPercentage();
};

const getMBTIPercentage = async (mbti1, mbti2) => {
  return await chatDao.getMBTIPercentage(mbti1, mbti2);
};

const schedule = require('node-schedule');
schedule.scheduleJob('0 0 * * *', updateMBTIPercentage);

const getChatRooms = async () => {
  return await chatDao.getChatRooms();
};

const getPotentialMatches = async (userMbti) => {
  return await chatDao.getPotentialMatches(userMbti);
};

const joinChatRoom = async (chatroomId, userId) => {
  const query = `
      INSERT INTO ChatRoomUser (chatroom_id, user_id)
      VALUES (?, ?)
  `;
  await connection.query(query, [chatroomId, userId]);
};

const getChatRoomsByUser = async (userId) => {
  return await chatDao.getChatRoomsByUser(userId);
};

const getChatRoomsByTags = async (interestTags) => {
  return await chatDao.getChatRoomsByTags(interestTags);
};

module.exports = {
  getMBTIPercentage,
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  getChatRooms,
  getPotentialMatches,
  joinChatRoom,
  getChatRoomsByUser,
  deleteMessage
};
