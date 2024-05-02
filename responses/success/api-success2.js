class NewApiDataSuccess {
  static send(message, statusCode, res, data, userId, userRole) {
    res.status(statusCode).json({
      message,
      success: true,
      data,
      userId,
      userRole,
    });
  }
}

module.exports = NewApiDataSuccess;
