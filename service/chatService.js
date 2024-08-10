const chatDao = require('../dao/chatDao');


const createChatRoom = async (userId, content) => {
  return await chatDao.createChatRoom(userId, content);
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

const schedule = require('node-schedule');
schedule.scheduleJob('0 0 * * *', updateMBTIPercentage);


module.exports = {
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  deleteMessage
};
