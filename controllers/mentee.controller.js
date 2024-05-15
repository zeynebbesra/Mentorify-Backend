const httpStatus = require("http-status");
const ApiError = require("../responses/success/api-success");
const bcrypt = require("bcrypt");
const ApiDataSuccess = require("../responses/success/api-success");
const Mentee = require("../models/mentee.model");
const { createLoginToken } = require("../helpers/jwt.helper");
const passwordHelper = require("../helpers/password.helper");
const validatePassword = require("../helpers/passwordValidator.helper");
const NewApiDataSuccess = require("../responses/success/api-success2");
const { uploadImage } = require('../helpers/uploadImage.helper');
// const { application } = require("express");


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

const getWishlist = async(req, res, next) => {
    const {menteeId} = req.params
    try {
        const mentee = await Mentee.findById(menteeId).populate('wishlist', 'name surname desc rating image')
        ApiDataSuccess.send("Mentee's wish list loaded", httpStatus.OK, res, mentee)
    } catch (error) {
        return next(    
            new ApiError(
                "Something went wrong :(",
                httpStatus.INTERNAL_SERVER_ERROR,
            )
        )
    }
}

// Get applications
const getApplications = async (req, res, next) => {
  try {
      const mentee = await Mentee.findById(req.user._id).populate('applications');
      NewApiDataSuccess.send("Mentee's applications list loaded", httpStatus.OK, res, mentee.applications);
  } catch (error) {
      return next(new ApiError("Error loading mentee's applications list", httpStatus.INTERNAL_SERVER_ERROR));
  }
};

// Add mentor to mentee's applications
const addMentorToList = async (req, res, next) => {
  const { mentorId } = req.body;
  try {
      const mentee = await Mentee.findByIdAndUpdate(req.user._id, {
          $push: { applications: mentorId }
      }, { new: true }).populate('applications');
      NewApiDataSuccess.send("Mentor added to applications", httpStatus.OK, res, mentee);
  } catch (error) {
      return next(new ApiError("An error occurred while adding mentor", httpStatus.INTERNAL_SERVER_ERROR));
  }
};

//remove mentor from the list
const removeMentorFromList = async (req, res, next) => {
  const { mentorId } = req.params;
  try {
      const mentee = await Mentee.findByIdAndUpdate(req.user._id, {
          $pull: { applications: mentorId }
      }, { new: true }).populate('applications');
      NewApiDataSuccess.send("Mentor removed from applications", httpStatus.OK, res, mentee);
  } catch (error) {
      return next(new ApiError("An error occurred while removing mentor", httpStatus.INTERNAL_SERVER_ERROR));
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
    getApplications,
    addMentorToList,
    removeMentorFromList
}
