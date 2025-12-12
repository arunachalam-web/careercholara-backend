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

// --- Read FRONTEND_URL and sanitize it ---
let rawFrontend = process.env.FRONTEND_URL || '';
rawFrontend = String(rawFrontend).trim();

// remove illegal characters that break headers
rawFrontend = rawFrontend.replace(/[\n\r<>"]/g, '');

// build allowed list: if comma-separated, split into multiple
const allowedOrigins = rawFrontend
  ? rawFrontend.split(',').map(s => s.trim()).filter(Boolean)
  : [];

// cors options: allow requests from allowedOrigins; if none set, allow all (for testing)
const corsOptions = allowedOrigins.length
  ? {
      origin: function (origin, callback) {
        // allow if no origin (e.g., server-to-server or curl), or if origin is in allowed list
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // enable pre-flight

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
  if (allowedOrigins.length) {
    console.log('CORS allowed for:', allowedOrigins);
  } else {
    console.log('CORS allowed for all origins (no FRONTEND_URL set)');
  }
});
