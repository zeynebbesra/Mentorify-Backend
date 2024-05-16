const express = require("express");
const router = express.Router();
const passport = require("../utils/passport");
const menteeController = require("../controllers/mentee.controller");
const {uploadOptions} = require('../helpers/uploadImage.helper')
const authenticateUser = require('../middlewares/authMiddleware');

router.route("/register").post(menteeController.register);

router.route("/login").post(menteeController.login);

// Google ile giriş yapma yolu
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback yolu
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/mentee" }),
  menteeController.googleLogin
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

router
  .route('/add-to-wishlist/:menteeId/:mentorId')
  .put(menteeController.addToWishlist)

router
  .route('/remove-from-wishlist/:menteeId/:mentorId')
  .put(menteeController.addToWishlist)

router
  .route('/wishlist/:menteeId')
  .get(menteeController.getWishlist)

// router.get('/applications', authenticateUser, menteeController.getApplications);

router.get('/applications', (req, res, next) => {
  console.log('Route /applications hit');  // Eklenen log
  next();
}, authenticateUser, (req, res, next) => {
  console.log('Middleware passed');  // Eklenen log
  next();
}, menteeController.getApplications);

router.post('/applications/:mentorId', authenticateUser, menteeController.addMentorToList);

router.delete('/applications/:mentorId', authenticateUser, menteeController.removeMentorFromList);

module.exports = router