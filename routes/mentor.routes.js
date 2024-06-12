const express = require('express')
const mentorController = require('../controllers/mentor.controller')
const router = express.Router()
const {uploadOptions} = require('../helpers/uploadImage.helper')
const authenticateUser = require('../middlewares/authMiddleware');

router
    .route('/')
    .get(mentorController.getMentors)

router.post('/register', uploadOptions.single('image'), mentorController.register)

router
  .route('/:id')
  .patch(uploadOptions.single('image'), mentorController.updateMentor)

//Şifre güncelleme talebi route'u
router
    .route('/:id/request-password-update')
    .patch(mentorController.requestPasswordUpdateMentor)

//Şifre güncelleme doğrulama route'u
router
    .route('/:id/verify-password-update')
    .patch(mentorController.verifyPasswordUpdateMentor)

router
    .route('/login')
    .post(mentorController.login)

   
router
    .route('/forgot-password')
    .post(mentorController.forgotPasswordMentor)

router
    .route('/reset-password/:token')
    .put(mentorController.resetPasswordMentor)

router
    .route('/delete/:id')
    .delete(mentorController.deleteMentor)

router
    .route('/:id')
    .get(mentorController.getMentor)

router.get('/applicants/:mentorId', mentorController.getApplicants)

router.post('/applicants/approve/:mentorId', mentorController.approveMentee)

router.post('/applicants/reject/:mentorId', mentorController.rejectMentee)

module.exports = router
