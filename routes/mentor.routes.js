const express = require('express')
const mentorController = require('../controllers/mentor.controller')
const router = express.Router()
const uploadOptions = require('../helpers/uploadImage.helper')

router
    .route('/')
    .get(mentorController.getMentors)

router
    .route('/register')
    .post(uploadOptions.single('photo'), mentorController.register)

router
    .route('/login')
    .post(mentorController.login)

router
    .route('/update/:id')
    .put(mentorController.updateMentor)

router
    .route('/delete/:id')
    .delete(mentorController.deleteMentor)

module.exports = router
