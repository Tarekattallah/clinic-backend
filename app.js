const express = require('express');
const dotenv  = require('dotenv');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

dotenv.config();

// Validate required env vars before anything else
require('./src/config/validateEnv')();

const connectDB                  = require('./src/config/database');
const { notFound, errorHandler } = require('./src/middlewares/error.middleware');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ── SECURITY ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving /uploads images
}));
app.use(cors({
  https:clinic-frontend-vert.vercel.app
  // origin:      process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── STATIC FILES ───────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./src/routes/auth.routes'));
app.use('/api/users',           require('./src/routes/user.routes'));
app.use('/api/doctors',         require('./src/routes/doctor.routes'));
app.use('/api/specialties',     require('./src/routes/specialty.routes'));
app.use('/api/appointments',    require('./src/routes/appointment.routes'));
app.use('/api/medical-records', require('./src/routes/medicalRecord.routes'));
app.use('/api/admin',           require('./src/routes/admin.routes'));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'MediCare API running', env: process.env.NODE_ENV }));

app.use(notFound);
app.use(errorHandler);

// ── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    if (!isProd) console.log(`✅ Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    if (!isProd) console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      require('mongoose').connection.close(false, () => {
        if (!isProd) console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
};

startServer();
