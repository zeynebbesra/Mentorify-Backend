const express = require('express')
const router = express.Router()
// const passport = require('passport')
const passport = require('../utils/passport')
const menteeController = require('../controllers/mentee.controller')

router
    .route('/register/mentee')
    .post(menteeController.register)

router
    .route('/login/mentee')
    .post(menteeController.login)

// Google ile giriş yapma yolu
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback yolu
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login/mentee' }),
  menteeController.googleLogin);


module.exports = router