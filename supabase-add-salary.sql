-- Add current_salary column to career_profiles table
ALTER TABLE career_profiles
ADD COLUMN current_salary DECIMAL(12, 2);

-- Add comment to document the column
COMMENT ON COLUMN career_profiles.current_salary IS 'Current annual salary for reference in career coaching';
