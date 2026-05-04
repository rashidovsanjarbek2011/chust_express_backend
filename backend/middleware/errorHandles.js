const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Prisma specific errors
  if (err.code === 'P2002') {
    error = new ApiError(409, 'Duplicate value entered');
  }
  if (err.code === 'P2025') {
    error = new ApiError(404, 'Record not found');
  }

  console.error(err);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;