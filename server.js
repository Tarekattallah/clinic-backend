// server.js – only used when running locally
const app = require('./app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    if (!isProd) console.log(`✅ Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    if (!isProd) console.log(`\n${signal} received — shutting down`);
    server.close(() => {
      require('mongoose').connection.close(false, () => {
        if (!isProd) console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
