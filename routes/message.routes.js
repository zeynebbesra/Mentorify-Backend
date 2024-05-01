const express = require('express')
const MessageController = require('../controllers/message.controller')

const router = express.Router();

router.route("/:id/:senderId").get(MessageController.getMessages);
router.route("/send/:id").post(MessageController.sendMessage);
router.route("/:id").get(MessageController.getUsersForSidebar)

module.exports = router
