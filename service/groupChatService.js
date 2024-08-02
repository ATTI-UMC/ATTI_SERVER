const groupChatDao = require('../dao/groupChatDao');

class GroupChatService {
  async createGroupChat(userId, content) {
    const groupChatRoomId = await groupChatDao.createGroupChat(userId, content);
    return groupChatRoomId;
  }

  async getGroupChats() {
    const groupChats = await groupChatDao.getGroupChats();
    return groupChats;
  }

  async getGroupChatById(id) {
    const groupChat = await groupChatDao.getGroupChatById(id);
    return groupChat;
  }

  async addMessage(groupChatRoomId, userId, content) {
    const messageId = await groupChatDao.addMessage(groupChatRoomId, userId, content);
    return messageId;
  }

  async getMessages(groupChatRoomId) {
    const messages = await groupChatDao.getMessages(groupChatRoomId);
    return messages;
  }
  
  async deleteMessage(messageId) {
    await groupChatDao.deleteMessage(messageId);
  }

  async deleteGroupChat(id) {
    await groupChatDao.deleteGroupChat(id);
  }
}

module.exports = new GroupChatService();
