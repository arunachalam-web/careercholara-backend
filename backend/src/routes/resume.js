import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Analyze resume
router.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    // Check usage limit (simple: allow 3 resume checks per day per user)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageCount = await prisma.planUsage.count({
      where: {
        userId: req.user.id,
        type: 'resume',
        usedAt: {
          gte: today,
        },
      },
    });

    // Free tier: 3 resume checks per day
    const dailyLimit = 3;
    if (usageCount >= dailyLimit) {
      return res.status(403).json({
        error: 'Daily limit reached',
        limit: dailyLimit,
        used: usageCount,
      });
    }

    // TODO: Integrate OpenAI for actual analysis
    // For now, return a placeholder analysis
    /*
    import OpenAI from 'openai';
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a career counselor. Analyze the resume and provide feedback on strengths, areas for improvement, and suggestions.',
        },
        {
          role: 'user',
          content: resumeText,
        },
      ],
    });
    
    const analysis = completion.choices[0].message.content;
    */

    // Placeholder analysis
    const analysis = JSON.stringify({
      strengths: [
        'Clear structure and formatting',
        'Relevant experience mentioned',
      ],
      improvements: [
        'Add quantifiable achievements',
        'Include relevant skills section',
        'Tailor content to target role',
      ],
      suggestions: [
        'Use action verbs in descriptions',
        'Highlight key accomplishments',
        'Keep resume to 1-2 pages',
      ],
      score: 75,
      note: 'This is a placeholder analysis. Enable OpenAI integration for detailed feedback.',
    });

    // Save resume check
    await prisma.resumeCheck.create({
      data: {
        userId: req.user.id,
        resumeText,
        analysis,
      },
    });

    // Record usage
    await prisma.planUsage.create({
      data: {
        userId: req.user.id,
        type: 'resume',
      },
    });

    res.json({
      analysis: JSON.parse(analysis),
      message: 'Resume analyzed successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

