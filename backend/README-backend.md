# Backend Setup

## Prerequisites

- Node.js 18+ (ES modules support)
- npm or yarn

## Local Development

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and other variables
   ```

3. **Set up database**:
   ```bash
   npm run prisma:generate
   npm run migrate
   npm run seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:3001` (or PORT from .env)

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with watch mode
- `npm run migrate` - Run Prisma migrations (dev mode)
- `npm run migrate:deploy` - Run Prisma migrations (production)
- `npm run prisma:generate` - Generate Prisma Client
- `npm run seed` - Seed database with initial data

## API Endpoints

- `GET /api/health` - Health check endpoint

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

