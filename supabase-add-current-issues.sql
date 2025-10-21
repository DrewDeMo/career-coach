-- Add current_issues column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS current_issues TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN projects.current_issues IS 'Current blockers, challenges, or concerns for the project';

-- Update the status enum to include 'ongoing' for projects without specific start/end dates
-- First, check if the constraint exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'projects_status_check'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT projects_status_check;
    END IF;
END $$;

-- Add the updated constraint with 'ongoing' status
ALTER TABLE projects
ADD CONSTRAINT projects_status_check
CHECK (status IN ('active', 'ongoing', 'completed', 'on-hold', 'cancelled'));
