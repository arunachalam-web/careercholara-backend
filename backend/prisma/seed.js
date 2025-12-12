import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user if ADMIN_BOOTSTRAP_TOKEN is set
  if (process.env.ADMIN_BOOTSTRAP_TOKEN) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@careercholara.com' },
      update: {},
      create: {
        email: 'admin@careercholara.com',
        password: hashedPassword,
        name: 'Admin User',
        isAdmin: true,
      },
    });
    console.log('Admin user created:', admin.email);
  }

  // Create sample questions (skip if already exist)
  const questions = [
    {
      question: 'What is 15% of 200?',
      options: JSON.stringify(['25', '30', '35', '40']),
      correctAnswer: 1, // 30
      explanation: '15% of 200 = (15/100) × 200 = 30',
      category: 'quantitative',
      difficulty: 'easy',
    },
    {
      question: 'If all roses are flowers and some flowers are red, which statement is true?',
      options: JSON.stringify([
        'All roses are red',
        'Some roses are red',
        'No roses are red',
        'Cannot be determined'
      ]),
      correctAnswer: 3, // Cannot be determined
      explanation: 'We know roses are flowers, and some flowers are red, but we cannot conclude that roses are red.',
      category: 'logical',
      difficulty: 'medium',
    },
    {
      question: 'Choose the synonym of "Benevolent":',
      options: JSON.stringify(['Malevolent', 'Kind', 'Hostile', 'Cruel']),
      correctAnswer: 1, // Kind
      explanation: 'Benevolent means kind and well-meaning.',
      category: 'verbal',
      difficulty: 'medium',
    },
  ];

  // Create questions (createMany with skipDuplicates)
  const result = await prisma.question.createMany({
    data: questions,
    skipDuplicates: true,
  });

  console.log(`Seeded ${result.count} questions (${questions.length} total provided)`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

