const chatService = require('../service/chatService');

const createChatRoom = async (req, res) => {
  const { title, interest_tags } = req.body;
  const userId = req.user.userid;

  try {
      const chatroomId = await chatService.createChatRoom(userId, title, interest_tags);
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

const getMBTIPercentage = async (req, res) => {
  const { mbti1, mbti2 } = req.query;
  try {
    const percentage = await chatService.getMBTIPercentage(mbti1, mbti2);
    if (percentage !== null) {
      res.json({ mbti1, mbti2, percentage });
    } else {
      res.status(404).json({ error: 'MBTI 조합을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('Error fetching MBTI percentage:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const getChatRooms = async (req, res) => {
  try {
      const chatRooms = await chatService.getChatRooms();
      res.json(chatRooms);
  } catch (err) {
      console.error('Error fetching chat rooms:', err);
      res.status(500).json({ error: 'An error occurred' });
  }
};

const randomMatch = async (req, res) => {
  const userId = req.user.userid;
  const userMbti = req.user.MBTI_FK;

  try {
      const matches = await chatService.getPotentialMatches(userMbti);
      if (matches.length > 0) {
          const bestMatch = matches[0]; // 궁합이 가장 좋은 사용자 선택
          const chatroomId = await chatService.createChatRoom(userId, `Random Match with ${bestMatch.nickname}`, '');
          await chatService.joinChatRoom(chatroomId, bestMatch.userid);
          res.json({ chatroomId });
      } else {
          res.status(404).json({ error: 'No matches found' });
      }
  } catch (err) {
      console.error('Error during random match:', err);
      res.status(500).json({ error: 'An error occurred' });
  }
};

const getChatRoomsByUser = async (req, res) => {
  const userId = req.query.userId;

  try {
      const chatRooms = await chatService.getChatRoomsByUser(userId);
      res.json(chatRooms);
  } catch (err) {
      console.error('Error fetching user-specific chat rooms:', err);
      res.status(500).json({ error: 'An error occurred' });
  }
};

// 특정 해시태그를 포함하는 채팅방 목록을 조회
const getChatRoomsByTags = async (req, res) => {
  const interestTags = req.query.interest_tags;

  try {
      const chatRooms = await chatService.getChatRoomsByTags(interestTags);
      res.json(chatRooms);
  } catch (err) {
      console.error('Error fetching tag-specific chat rooms:', err);
      res.status(500).json({ error: 'An error occurred' });
  }
};


module.exports = {
  getMBTIPercentage,
  createChatRoom,
  getMessages,
  createMessage,
  deleteChatRoom,
  getChatRooms,
  randomMatch,
  getChatRoomsByUser,
  deleteMessage,
  getChatRoomsByTags
};
