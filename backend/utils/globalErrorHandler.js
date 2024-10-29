module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    code: error.statusCode,
    message: error.message,
  });
};
