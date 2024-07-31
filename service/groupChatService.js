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
}

module.exports = new GroupChatService();
