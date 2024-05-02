class ApiDataSuccess {
  static send(message, statusCode, res, data) {
    res.status(statusCode).json({
      message,
      success: true,
      data,
    });
  }
}

module.exports = ApiDataSuccess;
