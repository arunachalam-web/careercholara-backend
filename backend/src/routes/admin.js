import express from 'express';
import prisma from '../db.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            planUsages: true,
            payments: true,
            resumeChecks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Get all payments
router.get('/payments', async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

// Make a user admin
router.post('/make-admin', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    res.json({ message: 'User promoted to admin', user });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
});

export default router;

