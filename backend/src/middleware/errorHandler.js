import { StatusCodes } from 'http-status-codes';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
};