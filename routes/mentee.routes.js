const express = require('express')
const router = express.Router()
const passport = require('../utils/passport')
const menteeController = require('../controllers/mentee.controller')

router
    .route('/register')
    .post(menteeController.register)

router
    .route('/login')
    .post(menteeController.login)

// Google ile giriş yapma yolu
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback yolu
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login/mentee' }),
  menteeController.googleLogin);

router
  .route('/')
  .get(menteeController.getMentees)

router
  .route('/:id')
  .get(menteeController.getMentee)

router
  .route('/:id')
  .patch(menteeController.updateMentee)

router
  .route('/add-to-wishlist/:menteeId/:mentorId')
  .put(menteeController.addToWishlist)

router
  .route('/remove-from-wishlist/:menteeId/:mentorId')
  .put(menteeController.addToWishlist)

router
  .route('/wishlist/:menteeId')
  .get(menteeController.getWishlist)

module.exports = router
