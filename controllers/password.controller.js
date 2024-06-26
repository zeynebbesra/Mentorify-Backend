const ApiError = require("../responses/error/api-error");
const httpStatus = require("http-status");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { generateResetToken } = require("../helpers/passwordResetToken.helper");
const passwordHelper = require("../helpers/password.helper");
const validatePassword = require("../helpers/passwordValidator.helper");
const path = require("path");
const fs = require("fs");

const sendResetEmail = async (user, resetToken) => {
  const resetUrl = "localhost:3000/reset-password";
  const message = `
        <p>You requested a password reset.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
    `;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Password Reset",
    html: message,
  });
};

const forgotPassword = async (req, res, next, Model) => {
  try {
    const user = await Model.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(
          "No account with that email found.",
          httpStatus.BAD_REQUEST
        )
      );
    }

    const { resetToken, resetTokenExpires } = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    console.log("reset token:",resetToken)
    await user.save();

    await sendResetEmail(user, resetToken);

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    return next(
      new ApiError(
        "Something went wrong",
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
};

const resetPassword = async (req, res, next, Model) => {
  try {
    const user = await Model.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new ApiError(
          "Password reset token is invalid or has expired.",
          httpStatus.BAD_REQUEST
        )
      );
    }

    // Yeni şifreyi doğrulama
    try {
      validatePassword(req.body.password);
    } catch (validationError) {
      return next(
        new ApiError(validationError.message, httpStatus.BAD_REQUEST)
      );
    }

    // Şifreyi hashleme
    const hashedPassword = await passwordHelper.passwordToHash(
      req.body.password
    );

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset." });
  } catch (error) {
    return next(
      new ApiError(
        "Something went wrong",
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
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

    console.log("Verification Code:", verificationCode);
    console.log(
      "Expires:",
      new Date(user.verificationCodeExpires).toLocaleString()
    );

    const verificationCodeHtml = String(verificationCode)
      .split("")
      .map(
        (num) => `
    <p style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; font-size: 1.5rem; font-weight: 500; color: #3182ce; border: 1px solid #3182ce; border-radius: 0.375rem;">${num}</p>
  `
      )
      .join("");

    const imagePath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "logo.svg"
    );
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    const imageSrc = `data:image/svg+xml;base64,${imageBase64}`;

    const emailTemplate = `
      <section style="max-width: 40rem; padding: 2rem; margin: 0 auto; background-color: #ffffff;">
        <header>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img style="height: 4rem; width: 4rem; display:inline;" src="${imageSrc}" alt="">
            <h1 style="font-size: 1rem; color: #2d3748;">Mentorify</h1>
          </div>
        </header>
        <main style="margin-top: 2rem;">
          <h2 style="color: #4a5568;">Merhaba ${user.name},</h2>
          <p style="margin-top: 0.5rem; line-height: 1.5; color: #718096;">
            Doğrulama kodun:
          </p>
          <div style="display: flex; align-items: center; margin-top: 1rem; gap: 1rem;">
            ${verificationCodeHtml}
          </div>
          <p style="margin-top: 1rem; line-height: 1.5; color: #718096;">
            Bu kodu şifreni güncellemek için kullanabilirsin. 5 dakika içinde geçersiz olacaktır.
          </p>
          <p style="margin-top: 2rem; color: #718096;">
            Teşekkürler, <br>
            Mentorify Ekibi
          </p>
        </main>
      </section>
    `;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Şifre Güncelleme Doğrulama Kodu",
      html: emailTemplate,
    });

    res
      .status(200)
      .json({ message: "Verification code sent to email.", success: true });
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(
        "Something went wrong",
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
};

const verifyPasswordUpdate = async (req, res, next, Model) => {
  try {
    const { id } = req.params;
    const { verificationCode, newPassword } = req.body;

    const user = await Model.findById(id);
    if (!user) {
      return next(new ApiError("User not found.", httpStatus.NOT_FOUND));
    }

    const currentTime = Date.now();
    console.log("Current Time:", new Date(currentTime).toLocaleString());
    console.log("Stored Code:", user.verificationCode);
    console.log(
      "Expires:",
      new Date(user.verificationCodeExpires).toLocaleString()
    );

    if (
      user.verificationCode !== parseInt(verificationCode, 10) ||
      user.verificationCodeExpires < currentTime
    ) {
      return next(
        new ApiError(
          "Invalid or expired verification code.",
          httpStatus.BAD_REQUEST
        )
      );
    }

    // Şifre doğrulaması
    try {
      validatePassword(newPassword);
    } catch (validationError) {
      return next(
        new ApiError(validationError.message, httpStatus.BAD_REQUEST)
      );
    }

    const hashedPassword = await passwordHelper.passwordToHash(newPassword);

    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Password updated successfully.", success: true });
  } catch (error) {
    console.error("Error:", error);
    return next(
      new ApiError(
        "Something went wrong",
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  sendResetEmail,
  requestPasswordUpdate,
  verifyPasswordUpdate,
};
