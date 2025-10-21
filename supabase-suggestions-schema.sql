-- Create suggestions table to store extracted entities awaiting user confirmation
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('skill', 'skill_update', 'goal', 'project', 'challenge', 'achievement', 'profile_update')),
    entity_data JSONB NOT NULL,
    context TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_conversation_id ON suggestions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_entity_type ON suggestions(entity_type);

-- Enable RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own suggestions"
    ON suggestions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
    ON suggestions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
    ON suggestions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suggestions"
    ON suggestions FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER suggestions_updated_at
    BEFORE UPDATE ON suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_suggestions_updated_at();

-- Add suggestions table to database types
COMMENT ON TABLE suggestions IS 'Stores extracted entities from conversations awaiting user confirmation';
COMMENT ON COLUMN suggestions.entity_type IS 'Type of entity: skill, skill_update, goal, project, challenge, achievement, profile_update';
COMMENT ON COLUMN suggestions.entity_data IS 'JSON data for the extracted entity';
COMMENT ON COLUMN suggestions.context IS 'Context/quote from conversation where entity was mentioned';
COMMENT ON COLUMN suggestions.status IS 'Status: pending, accepted, rejected';
