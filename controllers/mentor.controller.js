const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const ApiError = require("../responses/error/api-error");
const ApiDataSuccess = require("../responses/success/api-success");
const Mentor = require("../models/mentor.model");
const Mentee = require('../models/mentee.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createLoginToken } = require("../helpers/jwt.helper");
const passwordHelper = require("../helpers/password.helper");
const validatePassword = require("../helpers/passwordValidator.helper");
const NewApiDataSuccess = require("../responses/success/api-success2");
const { uploadImage } = require('../helpers/uploadImage.helper');

//Get Mentors
const getMentors = async (req, res, next) => {
  const mentors = await Mentor.find().select("-password");
  try {
    if (!mentors) {
      return next(new ApiError("Mentors failed to load", httpStatus.NOT_FOUND));
    }
    ApiDataSuccess.send(
      "Mentors loaded successfully",
      httpStatus.OK,
      res,
      mentors
    );
  } catch (error) {
    return next(
      new ApiError("An error ocured", httpStatus.INTERNAL_SERVER_ERROR)
    );
  }
};

//Get Mentor

const getMentor = async (req, res, next) => {
  const { id } = req.params;

  try {
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return next(
        new ApiError(
          `There is no mentor with this id: ${id}`,
          httpStatus.BAD_REQUEST
        )
      );
    }
    const { password, updatedAt, createdAt, ...other } = mentor._doc;

    ApiDataSuccess.send(
      "Mentor with given id found",
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
  const mentorPassword = await passwordHelper.passwordToHash(req.body.password);
  try {
    validatePassword(req.body.password);

    // const file = req.file;
    // if (!file)
    //   return res
    //     .status(404)
    //     .json({ message: "There is no image in the request" });

    // const fileName = req.file.filename;

    // const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const imagePath = uploadImage(req)
    if(!imagePath) {
      return next(
        new ApiError(
          "No image file provided",
          httpStatus.BAD_REQUEST
        )
      );
    }

    const newMentor = new Mentor({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: mentorPassword,
      jobTitle: req.body.jobTitle,
      category: req.body.category,
      interests: req.body.interests,
      desc: req.body.desc,
      image: imagePath,
      github: req.body.github,
      linkedin: req.body.linkedin,
      price: req.body.price,
    });

    const mentor = await newMentor.save();
    ApiDataSuccess.send(
      "Register succesfull!",
      httpStatus.CREATED,
      res,
      mentor
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
  }
};

//Login
const login = async (req, res, next) => {
  try {
    const user = await Mentor.findOne({ email: req.body.email });
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
      "Login succesfull!",
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

//Update Mentor
const updateMentor = async (req, res, next) => {
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

    const updatedMentor = await Mentor.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedMentor) {
      return next(new ApiError("Mentor not found.", httpStatus.NOT_FOUND));
    }

    return ApiDataSuccess.send(
      updatedData.password ? "Password changed successfully!" : "Profile updated successfully!",
      httpStatus.OK, 
      res,
      updatedMentor
    );
  } catch (error) {
    return next(new ApiError(
      error.message,
      console.log("error", error.message),
      "Something went wrong :(",
      httpStatus.INTERNAL_SERVER_ERROR
    ));
  }
};


const deleteMentor = async (req, res, next) => {
  try {
    const deletedUser = await Mentor.findByIdAndDelete(req.params.id);
    console.log("deleted user", deletedUser);
    if (!deletedUser) {
      return next(new ApiError("Mentor not found", httpStatus.NOT_FOUND));
    }
    ApiDataSuccess.send(
      "Mentor deleted successfully",
      httpStatus.OK,
      res,
      deletedUser
    );
  } catch (error) {
    return next(
      new ApiError("Failed to delete user", httpStatus.INTERNAL_SERVER_ERROR)
    );
  }
};



// View applicants list
const getApplicants = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId)
      .populate({
        path: 'applicants',
        select: 'name surname email image'
      })
      .populate({
        path: 'approvedMentees',
        select: 'name surname email image'
      });

    console.log("Mentor with applicants and approved mentees:", mentor);

    if (!mentor) {
      return next(
        new ApiError("Mentor not found", httpStatus.NOT_FOUND)
      );
    }

    const response = {
      applicants: mentor.applicants,
      approvedMentees: mentor.approvedMentees
    };

    ApiDataSuccess.send("Mentor's applicants and approved mentees loaded", httpStatus.OK, res, response);
  } catch (error) {
    console.error("Error loading mentor's applicants list:", error);
    return next(
      new ApiError("Error loading mentor's applicants list", httpStatus.INTERNAL_SERVER_ERROR)
    );
  }
};

//Approve Mentee

const approveMentee = async (req, res, next) => {
  const { menteeId } = req.body;
  try {
      const mentor = await Mentor.findById(req.params.mentorId);

      if (!mentor.applicants.includes(menteeId)) {
          return next(new ApiError("Mentee not found in applicants list", httpStatus.NOT_FOUND));
      }

      await Mentor.findByIdAndUpdate(req.user._id, {
          $pull: { applicants: menteeId },
          $push: { approvedMentees: menteeId }
      });

      await Mentee.findByIdAndUpdate(menteeId, {
          $push: { approvedMentors: req.user._id }
      });

      NewApiDataSuccess.send("Mentee approved successfully", httpStatus.OK, res, { menteeId });
  } catch (error) {
      return next(
        new ApiError(console.log("ERROR:",error.message),
        "An error occurred while approving mentee", 
        httpStatus.INTERNAL_SERVER_ERROR));
  }
};



//Reject Mentee

const rejectMentee = async (req, res, next) => {
  const { menteeId, paymentIntentId } = req.body;
  try {
      const mentor = await Mentor.findById(req.params.mentorId);

      if (!mentor.applicants.includes(menteeId)) {
          return next(new ApiError("Mentee not found in applicants list", httpStatus.NOT_FOUND));
      }

      await stripe.paymentIntents.cancel(paymentIntentId);

      await Mentor.findByIdAndUpdate(req.user._id, {
          $pull: { applicants: menteeId }
      });

      NewApiDataSuccess.send("Mentee rejected and payment cancelled", httpStatus.OK, res, { menteeId });
  } catch (error) {
      return next(new ApiError("An error occurred while rejecting mentee", httpStatus.INTERNAL_SERVER_ERROR));
  }
};


module.exports = {
  register,
  login,
  updateMentor,
  getMentors,
  deleteMentor,
  getMentor,
  getApplicants,
  approveMentee,
  rejectMentee
};
