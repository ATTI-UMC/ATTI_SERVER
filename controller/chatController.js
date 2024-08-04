const chatService = require('../service/chatService');

const createChatRoom = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const chatroomId = await chatService.createChatRoom(userId, content);
    res.json({ chatroomId });
  } catch (err) {
    console.error('Error creating chat room:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const getMessages = async (req, res) => {
  const chatroomId = req.params.chatroomId;
  try {
    const messages = await chatService.getMessages(chatroomId);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const createMessage = async (req, res) => {
  const chatroomId = req.params.chatroomId;
  const { userId, content } = req.body;
  try {
    const messageId = await chatService.createMessage(chatroomId, userId, content);
    res.json({ messageId });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const deleteChatRoom = async (req, res) => {
  const chatroomId = req.params.chatroomId;
  try {
    await chatService.deleteChatRoom(chatroomId);
    res.json({ message: 'Chat room deleted successfully' });
  } catch (err) {
    console.error('Error deleting chat room:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const deleteMessage = async (req, res) => {
  const messageId = req.params.messageId;
  try {
    await chatService.deleteMessage(messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = {
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  deleteMessage
};
