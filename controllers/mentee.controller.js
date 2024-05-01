const httpStatus = require("http-status");
const ApiError = require("../responses/success/api-success");
const bcrypt = require("bcrypt");
const ApiDataSuccess = require("../responses/success/api-success");
const Mentee = require("../models/mentee.model");
const { createLoginToken } = require("../helpers/jwt.helper");
const passwordHelper = require("../helpers/password.helper");
const validatePassword = require("../helpers/passwordValidator.helper");
const NewApiDataSuccess = require("../responses/success/api-success2");

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

//Login
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

module.exports = {
  register,
  login,
  googleLogin,
  getMentees,
  getMentee,
};
