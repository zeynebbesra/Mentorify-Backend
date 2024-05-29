const express = require("express");
const router = express.Router();
const passport = require("../utils/passport");
const menteeController = require("../controllers/mentee.controller");
const {uploadOptions} = require('../helpers/uploadImage.helper')
const authenticateUser = require('../middlewares/authMiddleware');

router.route("/register").post(menteeController.register);

router.route("/login").post(menteeController.login);

router
    .route('/forgot-password')
    .post(menteeController.forgotPasswordMentee)

router
    .route('/reset-password/:token')
    .put(menteeController.resetPasswordMentee)


// Google authentication route
router
    .route('/auth/google')
    .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google authentication callback route
router
    .route('/auth/google/callback')
    .get(
        passport.authenticate('google', { failureRedirect: '/' }),
        (req, res) => {
            // Successful authentication, redirect home or to another route
            res.redirect(`/api/v1/mentees/${req.user.id}`); // Başarılı oturum açma sonrası yönlendirme
        }
    );

router.route("/").get(menteeController.getMentees);

router.route("/:id").get(menteeController.getMentee);

router
  .route("/add-to-wishlist/:menteeId/:mentorId")
  .put(menteeController.addToWishlist);

router
  .route("/remove-from-wishlist/:menteeId/:mentorId")
  .delete(menteeController.removeFromWishlist);

// router
//   .route('/:id')
//   .patch(menteeController.updateMentee)

router.patch('/:id', uploadOptions.single('image'), menteeController.updateMentee);

// Şifre güncelleme talebi route'u
router
  .route('/:id/request-password-update')
  .patch(menteeController.requestPasswordUpdateMentee)

// Şifre güncelleme doğrulama route'u
router
  .route('/:id/verify-password-update')
  .patch(menteeController.verifyPasswordUpdateMentee)

router
  .route('/add-to-wishlist/:menteeId/:mentorId')
  .put(menteeController.addToWishlist)

router
  .route('/remove-from-wishlist/:menteeId/:mentorId')
  .put(menteeController.addToWishlist)

router
  .route('/wishlist/:menteeId')
  .get(menteeController.getWishlist)

// router.get('/applications/:id', menteeController.getApplications);

// router
//   .route('/applications')
//   .get(authenticateUser, menteeController.getApplications)

router
  .route('/applications/:menteeId')
  .get(menteeController.getAppliedMentors)

router
  .route('/applications/payment/:menteeId')
  .post(menteeController.processPayment)

router
  .route('/applications/:menteeId')
  .post(menteeController.applyToMentor)


router.delete('/applications/:mentorId/remove-mentor/:mentorId',menteeController.removeMentorFromList);

router
  .route('/:menteeId/reviews/:mentorId')
  .post(menteeController.addReview)


module.exports = router