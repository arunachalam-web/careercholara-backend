import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './src/routes/health.js';
import authRoutes from './src/routes/auth.js';
import aptitudeRoutes from './src/routes/aptitude.js';
import resumeRoutes from './src/routes/resume.js';
import paymentRoutes from './src/routes/payments.js';
import adminRoutes from './src/routes/admin.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// === CORS setup (use FRONTEND_URL if provided; otherwise allow all for testing) ===
const FRONTEND_URL = process.env.FRONTEND_URL || '';

const corsOptions = FRONTEND_URL
  ? { origin: FRONTEND_URL, credentials: true } // allow only your frontend
  : { origin: true, credentials: true };        // allow all origins (testing fallback)

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // enable pre-flight for all routes

// Middleware
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (FRONTEND_URL) {
    console.log(`CORS allowed for: ${FRONTEND_URL}`);
  } else {
    console.log('CORS allowed for all origins (no FRONTEND_URL set)');
  }
});
