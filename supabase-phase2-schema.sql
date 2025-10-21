-- =====================================================
-- Phase 2: Relationship Intelligence & Career Advancement
-- Database Schema Migration
-- =====================================================

-- =====================================================
-- 1. ENHANCE COWORKERS TABLE
-- =====================================================

-- Add new columns to existing coworkers table
ALTER TABLE coworkers
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'executive')),
ADD COLUMN IF NOT EXISTS influence_score INTEGER CHECK (influence_score >= 1 AND influence_score <= 10),
ADD COLUMN IF NOT EXISTS relationship_quality INTEGER CHECK (relationship_quality >= 1 AND relationship_quality <= 10),
ADD COLUMN IF NOT EXISTS trust_level INTEGER CHECK (trust_level >= 1 AND trust_level <= 10),
ADD COLUMN IF NOT EXISTS personality_traits JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS working_style JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS career_impact TEXT CHECK (career_impact IN ('positive', 'negative', 'neutral')),
ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS interaction_frequency TEXT CHECK (interaction_frequency IN ('daily', 'weekly', 'monthly', 'rarely'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coworkers_user_department ON coworkers(user_id, department);
CREATE INDEX IF NOT EXISTS idx_coworkers_influence ON coworkers(user_id, influence_score DESC);
CREATE INDEX IF NOT EXISTS idx_coworkers_relationship ON coworkers(user_id, relationship_quality DESC);

-- =====================================================
-- 2. CREATE COWORKER_INTERACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS coworker_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coworker_id UUID NOT NULL REFERENCES coworkers(id) ON DELETE CASCADE,
    interaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('meeting', 'conflict', 'collaboration', 'feedback', 'casual', 'email', 'chat', 'phone')),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    impact_on_career TEXT CHECK (impact_on_career IN ('helped', 'hindered', 'neutral')),
    description TEXT,
    notes JSONB DEFAULT '{}',
    outcomes TEXT,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    related_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    related_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for coworker_interactions
CREATE INDEX IF NOT EXISTS idx_interactions_user ON coworker_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_coworker ON coworker_interactions(coworker_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON coworker_interactions(user_id, interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON coworker_interactions(user_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_sentiment ON coworker_interactions(user_id, sentiment);

-- Enable RLS for coworker_interactions
ALTER TABLE coworker_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coworker_interactions
CREATE POLICY "Users can view their own interactions"
    ON coworker_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
    ON coworker_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
    ON coworker_interactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
    ON coworker_interactions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE DECISIONS TABLE (Decision Journal)
-- =====================================================

CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    decision_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reasoning TEXT,
    expected_outcome TEXT,
    actual_outcome TEXT,
    related_coworkers JSONB DEFAULT '[]',
    related_goals JSONB DEFAULT '[]',
    related_projects JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'ongoing', 'cancelled')),
    lessons_learned TEXT,
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for decisions
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_date ON decisions(user_id, decision_date DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_decisions_impact ON decisions(user_id, impact_score DESC);

-- Enable RLS for decisions
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decisions
CREATE POLICY "Users can view their own decisions"
    ON decisions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decisions"
    ON decisions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
    ON decisions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions"
    ON decisions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE MEETING_PREPARATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_preparations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meeting_date TIMESTAMPTZ NOT NULL,
    attendees JSONB DEFAULT '[]',
    objectives TEXT,
    ai_briefing JSONB DEFAULT '{}',
    talking_points JSONB DEFAULT '[]',
    potential_conflicts JSONB DEFAULT '[]',
    opportunities JSONB DEFAULT '[]',
    notes TEXT,
    outcome TEXT,
    follow_up_actions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for meeting_preparations
CREATE INDEX IF NOT EXISTS idx_meetings_user ON meeting_preparations(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meeting_preparations(user_id, meeting_date DESC);

-- Enable RLS for meeting_preparations
ALTER TABLE meeting_preparations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meeting_preparations
CREATE POLICY "Users can view their own meeting preps"
    ON meeting_preparations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meeting preps"
    ON meeting_preparations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting preps"
    ON meeting_preparations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting preps"
    ON meeting_preparations FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. UPDATE SUGGESTIONS TABLE FOR NEW ENTITY TYPES
-- =====================================================

-- Add new entity types to suggestions if not already present
-- The suggestions table should already support these via the entity_type column
-- Just ensure the check constraint includes the new types

-- Drop existing constraint if it exists
ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS suggestions_entity_type_check;

-- Add updated constraint with new entity types
ALTER TABLE suggestions ADD CONSTRAINT suggestions_entity_type_check 
    CHECK (entity_type IN ('skill', 'goal', 'project', 'challenge', 'achievement', 'coworker', 'interaction', 'decision'));

-- =====================================================
-- 6. CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_coworker_interactions_updated_at
    BEFORE UPDATE ON coworker_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decisions_updated_at
    BEFORE UPDATE ON decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_preparations_updated_at
    BEFORE UPDATE ON meeting_preparations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. CREATE VIEWS FOR ANALYTICS
-- =====================================================

-- View for relationship health overview
CREATE OR REPLACE VIEW relationship_health_overview AS
SELECT 
    c.user_id,
    COUNT(*) as total_coworkers,
    AVG(c.influence_score) as avg_influence,
    AVG(c.relationship_quality) as avg_relationship_quality,
    AVG(c.trust_level) as avg_trust_level,
    COUNT(CASE WHEN c.career_impact = 'positive' THEN 1 END) as positive_relationships,
    COUNT(CASE WHEN c.career_impact = 'negative' THEN 1 END) as negative_relationships,
    COUNT(CASE WHEN c.career_impact = 'neutral' THEN 1 END) as neutral_relationships
FROM coworkers c
GROUP BY c.user_id;

-- View for interaction statistics
CREATE OR REPLACE VIEW interaction_statistics AS
SELECT 
    ci.user_id,
    ci.coworker_id,
    COUNT(*) as total_interactions,
    COUNT(CASE WHEN ci.sentiment = 'positive' THEN 1 END) as positive_interactions,
    COUNT(CASE WHEN ci.sentiment = 'negative' THEN 1 END) as negative_interactions,
    COUNT(CASE WHEN ci.sentiment = 'neutral' THEN 1 END) as neutral_interactions,
    MAX(ci.interaction_date) as last_interaction,
    MIN(ci.interaction_date) as first_interaction
FROM coworker_interactions ci
GROUP BY ci.user_id, ci.coworker_id;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables exist
SELECT 
    'coworkers' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'coworkers'
UNION ALL
SELECT 
    'coworker_interactions' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'coworker_interactions'
UNION ALL
SELECT 
    'decisions' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'decisions'
UNION ALL
SELECT 
    'meeting_preparations' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'meeting_preparations';
