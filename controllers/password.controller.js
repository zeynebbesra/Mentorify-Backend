const ApiError = require("../responses/error/api-error")
const httpStatus = require('http-status');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { generateResetToken } = require("../helpers/passwordResetToken.helper")
const passwordHelper = require("../helpers/password.helper");
const validatePassword = require("../helpers/passwordValidator.helper");


const sendResetEmail = async (user, resetToken) => {
    const resetUrl = `http://localhost:8800/reset-password.html?token=${resetToken}`;
    const message = `
        <p>You requested a password reset.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
    `;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        html: message
    });
};

const forgotPassword = async (req, res, next, Model) => {
    try {
        const user = await Model.findOne({ email: req.body.email });
        if (!user) {
            return next(new ApiError("No account with that email found.", httpStatus.BAD_REQUEST));
        }

        const { resetToken, resetTokenExpires } = generateResetToken();

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        await sendResetEmail(user, resetToken);

        res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        return next(new ApiError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
};

const resetPassword = async (req, res, next, Model) => {
    try {
        const user = await Model.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return next(new ApiError("Password reset token is invalid or has expired.", httpStatus.BAD_REQUEST));
        }

        // Yeni şifreyi doğrulama
        try {
            validatePassword(req.body.password);
        } catch (validationError) {
            return next(new ApiError(validationError.message, httpStatus.BAD_REQUEST));
        }

        // Şifreyi hashleme
        const hashedPassword = await passwordHelper.passwordToHash(req.body.password)

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset.' });
    } catch (error) {
        return next(new ApiError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
};


const requestPasswordUpdate = async (req, res, next, Model) => {
    try {
      const { id } = req.params;
  
      const user = await Model.findById(id);
      if (!user) {
        return next(new ApiError("User not found.", httpStatus.NOT_FOUND));
      }
  
      const verificationCode = crypto.randomInt(100000, 999999);
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = Date.now() + 5 * 60 * 1000; // 5 dakika geçerli
      await user.save();
  
      console.log('Verification Code:', verificationCode);
      console.log('Expires:', new Date(user.verificationCodeExpires).toLocaleString());
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      const message = `
        <p>You requested to update your password. Please use the following verification code to complete the process:</p>
        <p><strong>${verificationCode}</strong></p>
      `;
  
      await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Update Verification',
        html: message
      });
  
      res.status(200).json({ message: 'Verification code sent to email.' });
    } catch (error) {
      return next(new ApiError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
}
  

const verifyPasswordUpdate = async (req, res, next, Model) => {
    try {
      const { id } = req.params;
      const { verificationCode, newPassword } = req.body;
  
      const user = await Model.findById(id);
      if (!user) {
        return next(new ApiError("User not found.", httpStatus.NOT_FOUND));
      }
  
      const currentTime = Date.now();
      console.log('Current Time:', new Date(currentTime).toLocaleString());
      console.log('Stored Code:', user.verificationCode);
      console.log('Expires:', new Date(user.verificationCodeExpires).toLocaleString());
  
      if (user.verificationCode !== parseInt(verificationCode, 10) || user.verificationCodeExpires < currentTime) {
        return next(new ApiError("Invalid or expired verification code.", httpStatus.BAD_REQUEST));
      }
  
      // Şifre doğrulaması
      try {
        validatePassword(newPassword);
      } catch (validationError) {
        return next(new ApiError(validationError.message, httpStatus.BAD_REQUEST));
      }
  
      const hashedPassword = await passwordHelper.passwordToHash(newPassword);
  
      user.password = hashedPassword;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error("Error:", error);
      return next(new ApiError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  

module.exports = {
    forgotPassword,
    resetPassword,
    sendResetEmail,
    requestPasswordUpdate,
    verifyPasswordUpdate
};