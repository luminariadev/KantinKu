// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    error: 'Terjadi kesalahan server',
    detail: process.env.NODE_ENV === 'development' ? err.message : null
  });
};

module.exports = errorHandler;