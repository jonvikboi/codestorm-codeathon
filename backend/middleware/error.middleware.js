const errorHandler = (err, req, res, next) => {
  console.error(`\n[ERROR] ${err.message}`);
  if (err.stack) console.error(`[ERROR STACK]`, err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: { error: process.env.NODE_ENV === 'development' ? err.stack : undefined },
  });
};

module.exports = {
  errorHandler,
};
