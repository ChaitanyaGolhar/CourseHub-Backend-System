module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "internal server error",
    ...(err.details && { details: err.details })
  });
};