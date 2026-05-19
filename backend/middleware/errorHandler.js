export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let statusCode = 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    return res.status(statusCode).json({
      error: message,
      details: err.errors
    });
  }

  // Handle Postgres errors (e.g. unique constraint violation)
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists (duplicate key)';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};
