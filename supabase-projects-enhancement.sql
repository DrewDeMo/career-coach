-- =====================================================
-- Projects Enhancement Schema
-- Comprehensive project management with tracking
-- =====================================================

-- Enhance existing projects table with comprehensive fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100) DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
ADD COLUMN IF NOT EXISTS actual_hours INTEGER,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS stakeholders JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS risks JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add indexes for enhanced fields
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(user_id, category);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_projects_completion ON projects(user_id, completion_percentage);

-- =====================================================
-- PROJECT MILESTONES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0,
    deliverables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for project_milestones
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user ON project_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON project_milestones(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_completed ON project_milestones(user_id, completed);

-- Enable RLS for project_milestones
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_milestones
CREATE POLICY "Users can view their own milestones"
    ON project_milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
    ON project_milestones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
    ON project_milestones FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
    ON project_milestones FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PROJECT TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    assigned_to TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    tags JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    blockers TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for project_tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON project_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON project_tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON project_tasks(user_id, due_date);

-- Enable RLS for project_tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tasks
CREATE POLICY "Users can view their own tasks"
    ON project_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON project_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON project_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON project_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PROJECT UPDATES TABLE (Progress logs)
-- =====================================================

CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    update_type TEXT NOT NULL CHECK (update_type IN ('progress', 'blocker', 'milestone', 'status_change', 'note')),
    title TEXT NOT NULL,
    description TEXT,
    previous_value TEXT,
    new_value TEXT,
    impact TEXT CHECK (impact IN ('positive', 'negative', 'neutral')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for project_updates
CREATE INDEX IF NOT EXISTS idx_updates_project ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_updates_user ON project_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_updates_date ON project_updates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_updates_type ON project_updates(user_id, update_type);

-- Enable RLS for project_updates
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_updates
CREATE POLICY "Users can view their own updates"
    ON project_updates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own updates"
    ON project_updates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own updates"
    ON project_updates FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PROJECT ISSUES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS project_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    category TEXT,
    reported_date TIMESTAMPTZ DEFAULT NOW(),
    resolved_date TIMESTAMPTZ,
    resolution TEXT,
    impact_on_timeline TEXT,
    related_tasks JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for project_issues
CREATE INDEX IF NOT EXISTS idx_issues_project ON project_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_user ON project_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON project_issues(user_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON project_issues(user_id, severity);

-- Enable RLS for project_issues
ALTER TABLE project_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_issues
CREATE POLICY "Users can view their own issues"
    ON project_issues FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own issues"
    ON project_issues FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issues"
    ON project_issues FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own issues"
    ON project_issues FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_project_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_issues_updated_at
    BEFORE UPDATE ON project_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR PROJECT ANALYTICS
-- =====================================================

-- Project overview with statistics
CREATE OR REPLACE VIEW project_overview AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.status,
    p.priority,
    p.completion_percentage,
    p.due_date,
    p.start_date,
    p.category,
    COUNT(DISTINCT pm.id) as total_milestones,
    COUNT(DISTINCT CASE WHEN pm.completed THEN pm.id END) as completed_milestones,
    COUNT(DISTINCT pt.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN pt.status = 'completed' THEN pt.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN pt.status = 'blocked' THEN pt.id END) as blocked_tasks,
    COUNT(DISTINCT CASE WHEN pi.status IN ('open', 'in_progress') THEN pi.id END) as open_issues,
    SUM(pt.estimated_hours) as total_estimated_hours,
    SUM(pt.actual_hours) as total_actual_hours,
    p.budget,
    p.actual_cost,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN project_milestones pm ON p.id = pm.project_id
LEFT JOIN project_tasks pt ON p.id = pt.project_id
LEFT JOIN project_issues pi ON p.id = pi.project_id
GROUP BY p.id;

-- Project health score view
CREATE OR REPLACE VIEW project_health AS
SELECT 
    p.id as project_id,
    p.user_id,
    p.name,
    p.status,
    CASE 
        WHEN p.completion_percentage >= 90 THEN 'excellent'
        WHEN p.completion_percentage >= 70 THEN 'good'
        WHEN p.completion_percentage >= 50 THEN 'fair'
        WHEN p.completion_percentage >= 30 THEN 'at_risk'
        ELSE 'critical'
    END as health_status,
    p.completion_percentage,
    COUNT(DISTINCT CASE WHEN pt.status = 'blocked' THEN pt.id END) as blocked_tasks_count,
    COUNT(DISTINCT CASE WHEN pi.status IN ('open', 'in_progress') AND pi.severity IN ('high', 'critical') THEN pi.id END) as critical_issues_count,
    CASE 
        WHEN p.due_date IS NOT NULL AND p.due_date < NOW() AND p.status != 'completed' THEN TRUE
        ELSE FALSE
    END as is_overdue,
    CASE 
        WHEN p.due_date IS NOT NULL AND p.due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' AND p.status != 'completed' THEN TRUE
        ELSE FALSE
    END as due_soon
FROM projects p
LEFT JOIN project_tasks pt ON p.id = pt.project_id
LEFT JOIN project_issues pi ON p.id = pi.project_id
GROUP BY p.id;

-- =====================================================
-- FUNCTIONS FOR PROJECT MANAGEMENT
-- =====================================================

-- Function to update project completion percentage based on tasks
CREATE OR REPLACE FUNCTION update_project_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_percentage INTEGER;
BEGIN
    -- Count total and completed tasks for the project
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END)
    INTO total_tasks, completed_tasks
    FROM project_tasks
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
    
    -- Calculate percentage
    IF total_tasks > 0 THEN
        new_percentage := ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
    ELSE
        new_percentage := 0;
    END IF;
    
    -- Update project
    UPDATE projects
    SET completion_percentage = new_percentage,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update project completion
CREATE TRIGGER auto_update_project_completion
    AFTER INSERT OR UPDATE OR DELETE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_completion();

-- Function to log project status changes
CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO project_updates (
            project_id,
            user_id,
            update_type,
            title,
            description,
            previous_value,
            new_value,
            impact
        ) VALUES (
            NEW.id,
            NEW.user_id,
            'status_change',
            'Project status changed',
            'Project status updated from ' || OLD.status || ' to ' || NEW.status,
            OLD.status,
            NEW.status,
            CASE 
                WHEN NEW.status = 'completed' THEN 'positive'
                WHEN NEW.status = 'cancelled' THEN 'negative'
                ELSE 'neutral'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project status changes
CREATE TRIGGER log_project_status_changes
    AFTER UPDATE ON projects
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_project_status_change();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify enhanced tables exist
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('projects', 'project_milestones', 'project_tasks', 'project_updates', 'project_issues')
GROUP BY table_name
ORDER BY table_name;
