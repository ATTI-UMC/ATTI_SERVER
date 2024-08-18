const express = require('express');

const groupChatController = require('../controller/groupChatController');

const router = express.Router();

router.post('/', groupChatController.createGroupChat);
router.get('/', groupChatController.getGroupChats);

router.get('/:id', groupChatController.getGroupChatById);
router.post('/message', groupChatController.addMessage);
router.get('/:groupChatRoomId/messages', groupChatController.getMessages);

router.delete('/message/:messageId', groupChatController.deleteMessage);
router.delete('/:id', groupChatController.deleteGroupChat);

router.post('/match/mbti', groupChatController.matchByMBTI);
router.post('/match/random', groupChatController.randomMatch);

module.exports = router;
