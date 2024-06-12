const express = require('express')
const router = express.Router()
const passwordController = require('../controllers/password.controller')

//Şifre güncelleme talebi route'u
router
    .route('/:id/request-password-update')
    .patch(passwordController.requestPasswordUpdate)

//Şifre güncelleme doğrulama route'u
router
    .route('/:id/verify-password-update')
    .patch(passwordController.verifyPasswordUpdate)
   
router
    .route('/forgot-password')
    .post(passwordController.forgotPassword)

router
    .route('/reset-password/:token')
    .put(passwordController.resetPassword)

module.exports = router