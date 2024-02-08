const express = require('express')
const mentorController = require('../controllers/mentor.controller')
const router = express.Router()

router
    .route('/register')
    .post(mentorController.register)

router
    .route('/login')
    .post(mentorController.login)

module.exports = router
