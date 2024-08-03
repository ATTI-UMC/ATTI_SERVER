const express = require('express');
const router = express.Router();
const JoinController = require('../controller/JoinController');

router.post('/sendemail', JoinController.joinRequest);
router.post('/verify', JoinController.verifyEmail);

module.exports = router;