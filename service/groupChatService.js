const groupChatDao = require('../dao/groupChatDao');

class GroupChatService {
  async createGroupChat(userId, Title,interest_tags) {
    const groupChatRoomId = await groupChatDao.createGroupChat(userId, Title,interest_tags);
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
  
  async matchByMBTI(mbti) {
    const matchedGroupChat = await groupChatDao.findGroupChatByMBTI(mbti);
    return matchedGroupChat ? matchedGroupChat.group_chatroom_id : null;
  }
  
  async randomMatch() {
    const randomGroupChat = await groupChatDao.getRandomGroupChat();
    return randomGroupChat ? randomGroupChat.group_chatroom_id : null;
  }
}

module.exports = new GroupChatService();
