const express = require('express')
const mentorController = require('../controllers/mentor.controller')
const router = express.Router()

router
    .route('/register/mentor')
    .post(mentorController.register)

router
    .route('/login/mentor')
    .post(mentorController.login)

module.exports = router
