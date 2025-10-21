# Career Coach LLM - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenAI API key

## Step 1: Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (takes ~2 minutes)
3. Once ready, go to **Project Settings** > **API**
4. Copy the following values:
   - Project URL
   - `anon` `public` API key

## Step 2: Run Database Schema

1. In your Supabase project, go to the **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema
6. Verify all tables were created by going to **Table Editor**

You should see these tables:
- users
- career_profiles
- coworkers
- projects
- skills
- goals
- challenges
- achievements
- training_sessions
- conversations

## Step 3: Configure Authentication

1. In Supabase, go to **Authentication** > **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates if desired (optional)

## Step 4: Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4-turbo
   ```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema Overview

### Core Tables

- **users**: Extended user profile information
- **career_profiles**: Current role, company, experience
- **coworkers**: Team members and relationships
- **projects**: Active and past projects with tech stacks
- **skills**: Technical and soft skills with proficiency levels
- **goals**: Career objectives and milestones
- **challenges**: Current struggles and blockers
- **achievements**: Career accomplishments
- **training_sessions**: AI coaching sessions conducted
- **conversations**: Chat history with context

### Security

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Next Steps

After setup, the application will guide you through an onboarding process to collect your career information.
