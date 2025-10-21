# Project Management System Setup Guide

This guide explains how to set up and use the comprehensive project management system for the Career Coach application.

## Overview

The project management system allows you to track work projects with detailed information including:
- Project details (name, description, status, priority)
- Due dates and completion tracking
- Budget and time estimates
- Milestones and deliverables
- Tasks with dependencies and blockers
- Issues and risks
- Progress updates and history
- Team members and stakeholders

## Database Setup

### 1. Run the Enhancement Schema

Execute the SQL migration to add enhanced project management tables:

```bash
# Connect to your Supabase project and run:
psql -h your-db-host -U postgres -d postgres -f career-coach/supabase-projects-enhancement.sql
```

Or use the Supabase dashboard SQL editor to run the contents of [`supabase-projects-enhancement.sql`](career-coach/supabase-projects-enhancement.sql:1).

### 2. Tables Created

The migration creates/enhances these tables:

- **projects** (enhanced) - Main project information with comprehensive fields
- **project_milestones** - Major project milestones with deliverables
- **project_tasks** - Individual tasks with status, priority, and dependencies
- **project_updates** - Progress logs and status changes
- **project_issues** - Problems, blockers, and risks

### 3. Views and Functions

The schema includes:
- **project_overview** - Aggregated project statistics
- **project_health** - Health status indicators
- **Auto-update triggers** - Automatic completion percentage calculation
- **Status change logging** - Automatic logging of important changes

## API Endpoints

### Projects

- `GET /api/projects` - List all projects with filters
  - Query params: `status`, `priority`, `category`, `archived`
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get project details with related data
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks

- `GET /api/projects/[id]/tasks` - List project tasks
  - Query params: `status`, `milestone_id`
- `POST /api/projects/[id]/tasks` - Create a new task

### Issues

- `GET /api/projects/[id]/issues` - List project issues
  - Query params: `status`, `severity`
- `POST /api/projects/[id]/issues` - Report a new issue

## UI Components

### ProjectCard Component

Displays project summary with:
- Status and priority badges
- Progress bar
- Statistics (milestones, tasks, issues)
- Due date with overdue/due soon indicators
- Tags and category

Usage:
```tsx
import { ProjectCard } from '@/components/ProjectCard'

<ProjectCard 
  project={project} 
  onClick={() => router.push(`/projects/${project.id}`)} 
/>
```

### Projects Page

Main projects listing page at `/projects` with:
- Search and filtering
- Tabs for different statuses
- Grid layout of project cards
- Create new project button

## Chat Integration

Projects are now intelligently included in chat context with:

### Smart Prioritization

Projects are scored and prioritized based on:
- **Priority level** - Critical/high priority projects get boosted
- **Issues** - Projects with open issues are prioritized
- **Due dates** - Overdue and due-soon projects are boosted
- **Completion** - Active projects with low completion are prioritized
- **Recency** - Recently updated projects score higher
- **Semantic relevance** - Projects matching conversation keywords

### Context Fields

The chat receives comprehensive project data:
- All project fields (name, description, status, priority, etc.)
- Milestone count
- Task count and status breakdown
- Issue count
- Progress percentage
- Budget vs actual cost
- Estimated vs actual hours

### Example Chat Queries

The AI can now answer questions like:
- "What projects am I working on?"
- "Show me my overdue projects"
- "What are the blockers on Project X?"
- "How is the budget tracking on my projects?"
- "What tasks are due this week?"
- "Which projects need attention?"

## Project Data Structure

### Project Fields

```typescript
{
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string | null
  
  // Dates
  start_date: string | null
  due_date: string | null
  end_date: string | null
  
  // Progress
  completion_percentage: number (0-100)
  
  // Resources
  budget: number | null
  actual_cost: number | null
  estimated_hours: number | null
  actual_hours: number | null
  
  // Arrays (JSONB)
  technologies: string[]
  team_members: string[]
  stakeholders: string[]
  goals: string[]
  risks: string[]
  dependencies: string[]
  deliverables: string[]
  tags: string[]
  
  // Other
  notes: string | null
  archived: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}
```

### Milestone Fields

```typescript
{
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  order_index: number
  deliverables: any[]
  created_at: string
  updated_at: string
}
```

### Task Fields

```typescript
{
  id: string
  project_id: string
  milestone_id: string | null
  user_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to: string | null
  due_date: string | null
  completed_at: string | null
  estimated_hours: number | null
  actual_hours: number | null
  tags: any[]
  dependencies: any[]
  blockers: string | null
  order_index: number
  created_at: string
  updated_at: string
}
```

### Issue Fields

```typescript
{
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
  category: string | null
  reported_date: string
  resolved_date: string | null
  resolution: string | null
  impact_on_timeline: string | null
  related_tasks: any[]
  created_at: string
  updated_at: string
}
```

## Best Practices

### Creating Projects

1. **Set clear priorities** - Use priority levels to help the AI understand importance
2. **Add due dates** - Enables overdue tracking and smart prioritization
3. **Use categories** - Group related projects for better organization
4. **Add tags** - Improves searchability and context matching
5. **Track budget/hours** - Monitor resource usage

### Managing Tasks

1. **Break down work** - Create specific, actionable tasks
2. **Set dependencies** - Track task relationships
3. **Update status regularly** - Keep completion percentage accurate
4. **Document blockers** - Help identify issues early

### Tracking Issues

1. **Set appropriate severity** - Critical issues get prioritized in chat
2. **Link to tasks** - Connect issues to affected work
3. **Document impact** - Note timeline and resource effects
4. **Update resolution** - Close issues when resolved

### Chat Interaction

1. **Be specific** - "Show me critical priority projects" vs "show projects"
2. **Ask about blockers** - "What's blocking Project X?"
3. **Request summaries** - "Summarize my project status"
4. **Get recommendations** - "Which project should I focus on?"

## Next Steps

1. Run the database migration
2. Create your first project via the UI at `/projects`
3. Add tasks and milestones
4. Start chatting about your projects!

## Troubleshooting

### Projects not showing in chat

- Ensure projects are not archived
- Check project status (only active/on-hold show by default)
- Verify user_id matches authenticated user

### Completion percentage not updating

- The trigger auto-updates based on task completion
- Ensure tasks have proper status values
- Check that tasks are linked to the project

### Issues not prioritizing correctly

- Set appropriate severity levels
- Ensure status is 'open' or 'in_progress'
- Link issues to related tasks for better context

## Support

For issues or questions, refer to:
- [`supabase-projects-enhancement.sql`](career-coach/supabase-projects-enhancement.sql:1) - Database schema
- [`lib/enhanced-context.ts`](career-coach/lib/enhanced-context.ts:132) - Context retrieval logic
- [`lib/relevance-scorer.ts`](career-coach/lib/relevance-scorer.ts:181) - Scoring algorithm
