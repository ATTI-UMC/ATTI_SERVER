const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const { checkAuthenticated } = require('../config/auth');

router.post('/create', checkAuthenticated, chatController.createChatRoom);
router.get('/:chatroomId/messages', checkAuthenticated, chatController.getMessages);
router.post('/:chatroomId/messages', checkAuthenticated, chatController.createMessage);
router.delete('/:chatroomId', checkAuthenticated, chatController.deleteChatRoom);
router.delete('/:chatroomId/messages/:messageId', checkAuthenticated, chatController.deleteMessage);

module.exports = router;
