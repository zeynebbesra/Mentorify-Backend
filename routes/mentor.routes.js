const express = require('express')
const mentorController = require('../controllers/mentor.controller')
const router = express.Router()
const {uploadOptions} = require('../helpers/uploadImage.helper')

router
    .route('/')
    .get(mentorController.getMentors)

router.post('/register', uploadOptions.single('image'), mentorController.register);

router.patch('/:id', uploadOptions.single('image'), mentorController.updateMentor);
    

router
    .route('/login')
    .post(mentorController.login)

// router
//     .route('/update/:id')
//     .patch(mentorController.updateMentor)

router
    .route('/delete/:id')
    .delete(mentorController.deleteMentor)

router
    .route('/:id')
    .get(mentorController.getMentor)

module.exports = router
