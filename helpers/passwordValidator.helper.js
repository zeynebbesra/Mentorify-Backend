const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasMinLength = password.length >= 8;
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase) {
        throw new Error("Password must contain at least one uppercase letter.");
    }

    if (!hasMinLength) {
        throw new Error("Password must be at least 8 characters long.");
    }

    if (!hasSymbol) {
        throw new Error("Password must contain at least one symbol.");
    }

    // Şifre kurallara uyuyorsa, true döner
    return true;
};

module.exports = validatePassword;