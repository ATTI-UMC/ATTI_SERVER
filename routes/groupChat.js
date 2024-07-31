const express = require('express');

const groupChatController = require('../controller/groupChatController');

const router = express.Router();

router.post('/', groupChatController.createGroupChat);
router.get('/', groupChatController.getGroupChats);

router.get('/:id', groupChatController.getGroupChatById);
router.post('/message', groupChatController.addMessage);
router.get('/:groupChatRoomId/messages', groupChatController.getMessages);

module.exports = router;
