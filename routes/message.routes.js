const express = require('express')
const messageController = require('../controllers/message.controller')

const router = express.Router();

router.route("/:id/:senderId").get(messageController.getMessages);
router.route("/send/:id").post(messageController.sendMessage);
router.route("/:id").get(messageController.getUsersForSidebar)
router.route("/messages/:messageId/delivered").patch(messageController.markMessageAsDelivered)


module.exports = router
