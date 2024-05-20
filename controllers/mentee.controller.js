const httpStatus = require("http-status");
const ApiError = require("../responses/success/api-success");
const bcrypt = require("bcrypt");
const ApiDataSuccess = require("../responses/success/api-success");
const Mentee = require("../models/mentee.model");
const Mentor = require("../models/mentor.model");
const Review = require("../models/review.model")
const { createLoginToken } = require("../helpers/jwt.helper");
const passwordHelper = require("../helpers/password.helper");
const validatePassword = require("../helpers/passwordValidator.helper");
const NewApiDataSuccess = require("../responses/success/api-success2");
const { uploadImage } = require('../helpers/uploadImage.helper');



//Get Mentees
const getMentees = async (req, res, next) => {
  const mentees = await Mentee.find().select("-password");

  try {
    if (!mentees) {
      return next(new ApiError("Mentees failed to load", httpStatus.NOT_FOUND));
    }
    ApiDataSuccess.send(
      "Mentees loaded successfully",
      httpStatus.OK,
      res,
      mentees
    );
  } catch (error) {
    return next(
      new ApiError("An error ocured", httpStatus.INTERNAL_SERVER_ERROR)
    );
  }
};

//Get Mentee
const getMentee = async (req, res, next) => {
  const { id } = req.params;

  try {
    const mentee = await Mentee.findById(id);
    if (!mentee) {
      return next(
        new ApiError(
          `There is no mentee with this id: ${id}`,
          httpStatus.BAD_REQUEST
        )
      );
    }
    const { password, updatedAt, createdAt, ...other } = mentee._doc;

    ApiDataSuccess.send(
      "Mentee with given id found",
      httpStatus.OK,
      res,
      other
    );
  } catch (error) {
    return next(new ApiError(error.message, httpStatus.NOT_FOUND));
  }
};

//Register
const register = async (req, res, next) => {
  const menteePassword = await passwordHelper.passwordToHash(req.body.password);
  try {
    validatePassword(req.body.password);
    //create new mentor
    const newMentee = new Mentee({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: menteePassword,
      desc: req.body.desc,
      interests: req.body.interests,
    });
    const mentee = await newMentee.save();
    ApiDataSuccess.send(
      "Register succesfull!",
      httpStatus.CREATED,
      res,
      mentee
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
  }
};


const login = async (req, res, next) => {
  try {
    const user = await Mentee.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError("Email or password is incorrect!", httpStatus.BAD_REQUEST)
      );

    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return next(
        new ApiError("Password is incorrect!", httpStatus.BAD_REQUEST)
      );
    }
    const accessToken = createLoginToken(user, res);
    NewApiDataSuccess.send(
      "Login successfull!",
      httpStatus.OK,
      res,
      accessToken,
      user._id,
      user.__t
    );
  } catch (error) {
    return next(
      new ApiError(
        console.log(error),
        "Something went wrong :(",
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
};


//Google ile giriş
const googleLogin = (req, res, next) => {
  // Kullanıcı bilgilerini işleme
  if (!req.user) {
    return next(
      new ApiError("Login with Google failed!", httpStatus.BAD_REQUEST)
    );
  }

  // Kullanıcı bilgilerini kullanarak bir token oluştur
  // const token = createLoginToken(req.user, res);

  // Kullanıcıya başarılı giriş yanıtı gönder
  ApiDataSuccess.send(
    "Login with Google successful!",
    httpStatus.OK,
    res,
    user
  );
};

//Update mentee
const updateMentee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (updatedData.password) {
      updatedData.password = await passwordHelper.passwordToHash(updatedData.password);
    }

    const imagePath = uploadImage(req);
    if (imagePath) {
      updatedData.image = imagePath;  
    }

    const updatedMentee = await Mentee.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedMentee) {
      return next(new ApiError("Mentee not found.", httpStatus.NOT_FOUND));
    }

    return ApiDataSuccess.send(
      updatedData.password ? "Password changed successfully!" : "Profile updated successfully!",
      httpStatus.OK, 
      res,
      updatedMentee
    );
  } catch (error) {
    return next(new ApiError(
      error.message,
      console.log("error",error.message),
      "Something went wrong :(",
      httpStatus.INTERNAL_SERVER_ERROR
    ));
  }
};


// Wishlist'e Mentor Ekleme
const addToWishlist = async(req,res,next) => {
    const {menteeId, mentorId} = req.params

    try {
        await Mentee.findByIdAndUpdate(menteeId, {
            $addToSet: {wishlist: mentorId}
        })
        ApiDataSuccess.send('Mentor added to wishlist successfully!', httpStatus.OK, res)
    } catch (error) {
        return next(    
            new ApiError(
                "Something went wrong :(",
                httpStatus.INTERNAL_SERVER_ERROR,
                error.message
            )
        )
    }
}


// Wishlist'e Mentor Çıkarma
const removeFromWishlist = async(req,res,next) => {
    const {menteeId, mentorId} = req.params

    try {
        await Mentee.findByIdAndUpdate(menteeId, {
            $pull: {wishlist: mentorId}
        })
        ApiDataSuccess.send('Mentor remove from wishlist successfully!', httpStatus.OK, res)
    } catch (error) {
        return next(    
            new ApiError(
                "Something went wrong :(",
                httpStatus.INTERNAL_SERVER_ERROR,
                error.message
            )
        )
    }
}


// Mentee'nin Wishlist'ini Görüntüleme

const getWishlist = async (req, res, next) => {
  const { menteeId } = req.params;
  try {
      const mentee = await Mentee.findById(menteeId).populate({
          path: 'wishlist',
          select: 'name surname jobTitle image'
      });
      
      if (!mentee) {
          return next(
              new ApiError(
                  "Mentee not found",
                  httpStatus.NOT_FOUND,
              )
          );
      }

      ApiDataSuccess.send("Mentee's wish list loaded", httpStatus.OK, res, mentee.wishlist);
  } catch (error) {
      return next(
          new ApiError(
              "Something went wrong :(",
              httpStatus.INTERNAL_SERVER_ERROR,
          )
      );
  }
};



const getAppliedMentors = async (req, res, next) => {
  const menteeId = req.params.menteeId;

  // console.log("getAppliedMentors: start");
  try {
    const mentee = await Mentee.findById(menteeId)
      .populate({
        path: 'applications',
        select: 'name surname jobTitle image' 
      });
    // console.log("getAppliedMentors - mentee:", mentee);

    if (!mentee) {
      console.error('Mentee not found');
      return next(new ApiError('Mentee not found', httpStatus.NOT_FOUND));
    }

    if (mentee.applications.length === 0) {
      return NewApiDataSuccess.send('No mentors applied yet', httpStatus.OK, res, []);
    }

    NewApiDataSuccess.send('Applied mentors fetched successfully', httpStatus.OK, res, mentee.applications);
    // console.log("getAppliedMentors: end");
  } catch (error) {
    console.error('Error fetching applied mentors:', error);
    return next(new ApiError('Internal Server Error', httpStatus.INTERNAL_SERVER_ERROR));
  }
};

// Process Payment

const processPayment = async (req, res, next) => {
  const { paymentIntentId } = req.body;
  const { menteeId } = req.params;
  try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
          NewApiDataSuccess.send("Payment completed successfully", httpStatus.OK, res, { menteeId });
      } else {
          throw new Error('Payment not successful');
      }
  } catch (error) {
      return next(new ApiError("An error occurred while processing payment", httpStatus.INTERNAL_SERVER_ERROR));
  }
};


const applyToMentor = async (req, res, next) => {
  const menteeId = req.params.menteeId;
  const { mentorId } = req.body;

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return next(new ApiError("Mentor not found", httpStatus.NOT_FOUND));
    }

    if (!mentor.applicants.includes(menteeId)) {
      mentor.applicants.push(menteeId);
    } else {
      return next(new ApiError("Already applied", httpStatus.BAD_REQUEST));
    }

    await mentor.save();

    const mentee = await Mentee.findById(menteeId);
    if (!mentee.applications.includes(mentorId)) {
      mentee.applications.push(mentorId);
    }

    await mentee.save();

    NewApiDataSuccess.send("Application submitted successfully", httpStatus.OK, res);
  } catch (error) {
    return next(new ApiError("Error submitting application", httpStatus.INTERNAL_SERVER_ERROR));
  }
};


const removeMentorFromList = async (req, res, next) => {
  const menteeId = req.params.menteeId;
  const { mentorId } = req.params;

  try {
    const mentee = await Mentee.findByIdAndUpdate(menteeId, {
      $pull: { applications: mentorId }
    }, { new: true }).populate('applications');

    NewApiDataSuccess.send("Mentor removed from applications", httpStatus.OK, res, mentee);
  } catch (error) {
    return next(new ApiError("An error occurred while removing mentor", httpStatus.INTERNAL_SERVER_ERROR));
  }
};

//Add review to mentor
// const addReview = async (req,res,next) => {
//   const {mentorId, menteeId} = req.params
//   const {rating, comment} = req.body
//   console.log("BODY:",req.body)
//   try {
//     const mentor = await Mentor.findById(mentorId)
//     const mentee = await Mentee.findById(menteeId)
//     console.log("MENTEE:",mentee)
//     console.log("MENTOR:",mentor)
//     if (!mentor || !mentee) {
//       return next(
//           new ApiError(
//               "Mentor or Mentee not found",
//               httpStatus.NOT_FOUND,
//           )
//       );
//     }
//     if (!mentee.approvedMentors.includes(mentorId)) {
//       return next(
//           new ApiError(
//               "Mentee is not approved by this mentor",
//               httpStatus.FORBIDDEN,
//           )
//       );
//     }
//     const newReview = new Review({
//       mentee: menteeId,
//       mentor: mentorId,
//       rating,
//       comment
//     })

//     await newReview.save()

//     mentor.reviews.push(newReview._id);
//     mentor.rating = (mentor.rating * mentor.reviews.length + rating) / (mentor.reviews.length + 1);
//     await mentor.save();

//     ApiDataSuccess.send("Review added successfully", httpStatus.CREATED, res, newReview);

    
//   } catch (error) {
//     return next(
//       new ApiError(
//         console.log("ERROR:",error.message),
//           "Something went wrong :(",
//           httpStatus.INTERNAL_SERVER_ERROR,
//       )
//     );
//   }
// }

const addReview = async (req, res, next) => {
  const { mentorId, menteeId } = req.params;
  const { rating, comment } = req.body;

  console.log('BODY:', req.body);
  console.log('MENTEE ID:', menteeId);
  console.log('MENTOR ID:', mentorId);

  try {
      const mentor = await Mentor.findById(mentorId);
      const mentee = await Mentee.findById(menteeId);

      console.log('MENTEE:', mentee);
      console.log('MENTOR:', mentor);

      if (!mentor || !mentee) {
          return next(
              new ApiError(
                  "Mentor or Mentee not found",
                  httpStatus.NOT_FOUND,
              )
          );
      }

      // Mentee'nin onaylı mentorlar listesinde olup olmadığını kontrol et
      if (!mentee.approvedMentors.includes(mentorId)) {
          return next(
              new ApiError(
                  "Mentee is not approved by this mentor",
                  httpStatus.FORBIDDEN,
              )
          );
      }

      const newReview = new Review({
          mentee: menteeId,
          mentor: mentorId,
          rating,
          comment
      });

      console.log("REVIEW:", newReview);

      await newReview.save();

      mentor.reviews.push(newReview._id);
      console.log("REVIEWS ARRAY:", mentor.reviews);

      // Mentor'un ratingini güncelleme mantığı düzeltilmeli
      if (mentor.reviews.length > 1) {
          mentor.rating = (mentor.rating * (mentor.reviews.length - 1) + rating) / mentor.reviews.length;
      } else {
          mentor.rating = rating;
      }
      console.log("NEW RATING:", mentor.rating);

      await mentor.save();

      ApiDataSuccess.send("Review added successfully", httpStatus.CREATED, res, newReview);
  } catch (error) {
      console.error('ERROR:', error);
      return next(
          new ApiError(
              "Something went wrong :(",
              httpStatus.INTERNAL_SERVER_ERROR,
          )
      );
  }
};


module.exports = {
    register,
    login,
    updateMentee,
    googleLogin,
    getMentees,
    getMentee,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    getAppliedMentors,
    applyToMentor,
    removeMentorFromList,
    processPayment,
    addReview
}
