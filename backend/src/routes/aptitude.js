import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get a random question
router.get('/question', authenticate, async (req, res, next) => {
  try {
    // Check usage limit (simple: allow 5 questions per day per user)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageCount = await prisma.planUsage.count({
      where: {
        userId: req.user.id,
        type: 'aptitude',
        usedAt: {
          gte: today,
        },
      },
    });

    // Free tier: 5 questions per day
    const dailyLimit = 5;
    if (usageCount >= dailyLimit) {
      return res.status(403).json({
        error: 'Daily limit reached',
        limit: dailyLimit,
        used: usageCount,
      });
    }

    // Get random question
    const questionCount = await prisma.question.count();
    if (questionCount === 0) {
      return res.status(404).json({ error: 'No questions available' });
    }

    const skip = Math.floor(Math.random() * questionCount);
    const question = await prisma.question.findFirst({
      skip,
      take: 1,
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Parse options
    const options = JSON.parse(question.options);

    res.json({
      id: question.id,
      question: question.question,
      options,
      category: question.category,
      difficulty: question.difficulty,
    });
  } catch (error) {
    next(error);
  }
});

// Submit answer
router.post('/answer', authenticate, async (req, res, next) => {
  try {
    const { questionId, selectedAnswer } = req.body;

    if (questionId === undefined || selectedAnswer === undefined) {
      return res.status(400).json({ error: 'questionId and selectedAnswer are required' });
    }

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if correct
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Record usage
    await prisma.planUsage.create({
      data: {
        userId: req.user.id,
        type: 'aptitude',
      },
    });

    // Parse options for response
    const options = JSON.parse(question.options);

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      correctOption: options[question.correctAnswer],
      explanation: question.explanation,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

