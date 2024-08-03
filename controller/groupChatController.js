const groupChatService = require('../service/groupChatService');

class GroupChatController {
  async createGroupChat(req, res) {
    try {
      const { userId, content } = req.body;
      const groupChatRoomId = await groupChatService.createGroupChat(userId, content);
      res.status(201).json({ groupChatRoomId });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getGroupChats(req, res) {
    try {
      const groupChats = await groupChatService.getGroupChats();
      res.status(200).json(groupChats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getGroupChatById(req, res) {
    try {
      const { id } = req.params;
      const groupChat = await groupChatService.getGroupChatById(id);
      if (groupChat) {
        res.status(200).json(groupChat);
      } else {
        res.status(404).json({ message: 'Group chat not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async addMessage(req, res) {
    try {
      const { groupChatRoomId, userId, content } = req.body;
      const messageId = await groupChatService.addMessage(groupChatRoomId, userId, content);
      res.status(201).json({ messageId });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const { groupChatRoomId } = req.params;
      const messages = await groupChatService.getMessages(groupChatRoomId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      await groupChatService.deleteMessage(messageId);
      res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteGroupChat(req, res) {
    try {
      const { id } = req.params;
      await groupChatService.deleteGroupChat(id);
      res.status(200).json({ message: 'Group chat deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


}

module.exports = new GroupChatController();
