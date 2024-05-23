const crypto = require('crypto');

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = Date.now() + 3600000; // 1 saat geçerli
  return { resetToken, resetTokenExpires };
};

module.exports = {
    generateResetToken
}
