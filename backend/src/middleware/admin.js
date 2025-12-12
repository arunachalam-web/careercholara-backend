import { authenticate } from './auth.js';

export const requireAdmin = (req, res, next) => {
  // First authenticate
  authenticate(req, res, () => {
    // Then check if admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

