# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code Bus is a Next.js 15 application for bus driver's license exam preparation (French "code de la route" for bus category). Users can practice with questions, take timed exams, track progress, and earn achievements.

## Development Commands

```bash
# Install dependencies and set up database
npm run setup

# Development
npm run dev

# Build (generates Prisma client first)
npm run build

# Lint
npm run lint

# Database commands
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed with initial data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (runs scripts/reset-db.sh)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Google OAuth and Credentials providers
- **Styling**: Tailwind CSS with shadcn/ui components
- **Storage**: Vercel Blob for images

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui in `components/ui/`)
- `lib/` - Core utilities and business logic
- `prisma/` - Database schema and seed script
- `scripts/` - Database and admin utilities

### Core Modules

**Question Selection (`lib/questionSelector.ts`)**
- Intelligent question selection for exams based on user history
- Prioritizes unseen questions and failed ones
- Balances questions across categories

**Achievement System (`lib/achievements/`)**
- `definitions.ts` - All trophy definitions with requirements
- `checker.ts` - Logic to check and unlock achievements
- Categories: exam, training, answers, streak, category mastery, speed, time

**Authentication (`lib/auth.ts`)**
- JWT-based sessions
- Role-based access (ADMIN, STUDENT)
- Custom redirect logic

### Data Models (Prisma)

Main models:
- `Question` - Exam questions with images, options, categories
- `Attempt` - User answer attempts with timing
- `ExamHistory` / `ExamAnswer` - Completed exams with detailed answers
- `QuestionProgress` - Spaced repetition progress per question
- `Achievement` - Unlocked trophies per user
- `User` / `Account` / `Session` - NextAuth models

### Environment Variables Required

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BLOB_READ_WRITE_TOKEN=... (for Vercel Blob)
```

## Key Features

1. **Training Mode** (`/train`) - Practice with immediate feedback, filtering by questionnaire/category
2. **Exam Mode** (`/exam`) - Timed tests with smart question selection, performance scoring (0-1000 points)
3. **Dashboard** (`/dashboard`) - Progress statistics and charts
4. **Achievements** (`/achievements`) - Trophy system with 60+ badges across 9 categories
5. **JSON Editor** (`/json-editor`) - Admin tool for managing questions

## Notes

- The app is in French (interface and questions)
- Images are stored on Vercel Blob and mapped via `lib/blob-helper.ts`
- Questions belong to numbered questionnaires (1-5) with categories like "Signalisation", "Freins", etc.
- Performance scoring: 700 points for accuracy + up to 300 points for speed
