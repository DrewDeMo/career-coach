export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            career_profiles: {
                Row: {
                    id: string
                    user_id: string
                    role_title: string
                    company: string | null
                    department: string | null
                    years_experience: number | null
                    industry: string | null
                    responsibilities: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    role_title: string
                    company?: string | null
                    department?: string | null
                    years_experience?: number | null
                    industry?: string | null
                    responsibilities?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    role_title?: string
                    company?: string | null
                    department?: string | null
                    years_experience?: number | null
                    industry?: string | null
                    responsibilities?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            coworkers: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    role: string | null
                    relationship: string | null
                    communication_style: string | null
                    notes: Json
                    department: string | null
                    seniority_level: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'executive' | null
                    influence_score: number | null
                    relationship_quality: number | null
                    trust_level: number | null
                    personality_traits: Json
                    working_style: Json
                    career_impact: 'positive' | 'negative' | 'neutral' | null
                    last_interaction_date: string | null
                    interaction_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    role?: string | null
                    relationship?: string | null
                    communication_style?: string | null
                    notes?: Json
                    department?: string | null
                    seniority_level?: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'executive' | null
                    influence_score?: number | null
                    relationship_quality?: number | null
                    trust_level?: number | null
                    personality_traits?: Json
                    working_style?: Json
                    career_impact?: 'positive' | 'negative' | 'neutral' | null
                    last_interaction_date?: string | null
                    interaction_frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    role?: string | null
                    relationship?: string | null
                    communication_style?: string | null
                    notes?: Json
                    department?: string | null
                    seniority_level?: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'executive' | null
                    influence_score?: number | null
                    relationship_quality?: number | null
                    trust_level?: number | null
                    personality_traits?: Json
                    working_style?: Json
                    career_impact?: 'positive' | 'negative' | 'neutral' | null
                    last_interaction_date?: string | null
                    interaction_frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    status: 'active' | 'ongoing' | 'completed' | 'on-hold' | 'cancelled'
                    description: string | null
                    technologies: Json
                    start_date: string | null
                    end_date: string | null
                    team_members: Json
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    due_date: string | null
                    completion_percentage: number
                    budget: number | null
                    actual_cost: number | null
                    estimated_hours: number | null
                    actual_hours: number | null
                    category: string | null
                    tags: Json
                    stakeholders: Json
                    goals: Json
                    risks: Json
                    dependencies: Json
                    deliverables: Json
                    notes: string | null
                    current_issues: string | null
                    archived: boolean
                    archived_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    status?: 'active' | 'ongoing' | 'completed' | 'on-hold' | 'cancelled'
                    description?: string | null
                    technologies?: Json
                    start_date?: string | null
                    end_date?: string | null
                    team_members?: Json
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    due_date?: string | null
                    completion_percentage?: number
                    budget?: number | null
                    actual_cost?: number | null
                    estimated_hours?: number | null
                    actual_hours?: number | null
                    category?: string | null
                    tags?: Json
                    stakeholders?: Json
                    goals?: Json
                    risks?: Json
                    dependencies?: Json
                    deliverables?: Json
                    notes?: string | null
                    current_issues?: string | null
                    archived?: boolean
                    archived_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    status?: 'active' | 'ongoing' | 'completed' | 'on-hold' | 'cancelled'
                    description?: string | null
                    technologies?: Json
                    start_date?: string | null
                    end_date?: string | null
                    team_members?: Json
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    due_date?: string | null
                    completion_percentage?: number
                    budget?: number | null
                    actual_cost?: number | null
                    estimated_hours?: number | null
                    actual_hours?: number | null
                    category?: string | null
                    tags?: Json
                    stakeholders?: Json
                    goals?: Json
                    risks?: Json
                    dependencies?: Json
                    deliverables?: Json
                    notes?: string | null
                    current_issues?: string | null
                    archived?: boolean
                    archived_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            skills: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    category: string | null
                    proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
                    last_used: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    category?: string | null
                    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
                    last_used?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    category?: string | null
                    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
                    last_used?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            goals: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    category: string | null
                    status: 'active' | 'completed' | 'abandoned'
                    target_date: string | null
                    milestones: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    category?: string | null
                    status?: 'active' | 'completed' | 'abandoned'
                    target_date?: string | null
                    milestones?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    category?: string | null
                    status?: 'active' | 'completed' | 'abandoned'
                    target_date?: string | null
                    milestones?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            challenges: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    category: string | null
                    status: 'active' | 'resolved' | 'ongoing'
                    context: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    category?: string | null
                    status?: 'active' | 'resolved' | 'ongoing'
                    context?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    category?: string | null
                    status?: 'active' | 'resolved' | 'ongoing'
                    context?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            achievements: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    achieved_date: string | null
                    impact: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    achieved_date?: string | null
                    impact?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    achieved_date?: string | null
                    impact?: Json
                    created_at?: string
                }
            }
            training_sessions: {
                Row: {
                    id: string
                    user_id: string
                    topic: string
                    description: string | null
                    session_date: string | null
                    attendee_count: number | null
                    feedback: Json
                    ai_tools_covered: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    topic: string
                    description?: string | null
                    session_date?: string | null
                    attendee_count?: number | null
                    feedback?: Json
                    ai_tools_covered?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    topic?: string
                    description?: string | null
                    session_date?: string | null
                    attendee_count?: number | null
                    feedback?: Json
                    ai_tools_covered?: Json
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    user_id: string
                    title: string | null
                    messages: Json
                    context_used: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string | null
                    messages?: Json
                    context_used?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string | null
                    messages?: Json
                    context_used?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            suggestions: {
                Row: {
                    id: string
                    user_id: string
                    conversation_id: string | null
                    entity_type: 'skill' | 'skill_update' | 'goal' | 'project' | 'challenge' | 'achievement' | 'profile_update' | 'coworker' | 'interaction' | 'decision'
                    entity_data: Json
                    context: string
                    status: 'pending' | 'accepted' | 'rejected'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    conversation_id?: string | null
                    entity_type: 'skill' | 'skill_update' | 'goal' | 'project' | 'challenge' | 'achievement' | 'profile_update' | 'coworker' | 'interaction' | 'decision'
                    entity_data: Json
                    context: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    conversation_id?: string | null
                    entity_type?: 'skill' | 'skill_update' | 'goal' | 'project' | 'challenge' | 'achievement' | 'profile_update' | 'coworker' | 'interaction' | 'decision'
                    entity_data?: Json
                    context?: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                    updated_at?: string
                }
            }
            coworker_interactions: {
                Row: {
                    id: string
                    user_id: string
                    coworker_id: string
                    interaction_date: string
                    interaction_type: 'meeting' | 'conflict' | 'collaboration' | 'feedback' | 'casual' | 'email' | 'chat' | 'phone'
                    sentiment: 'positive' | 'negative' | 'neutral'
                    impact_on_career: 'helped' | 'hindered' | 'neutral' | null
                    description: string | null
                    notes: Json
                    outcomes: string | null
                    related_project_id: string | null
                    related_goal_id: string | null
                    related_challenge_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    coworker_id: string
                    interaction_date?: string
                    interaction_type: 'meeting' | 'conflict' | 'collaboration' | 'feedback' | 'casual' | 'email' | 'chat' | 'phone'
                    sentiment: 'positive' | 'negative' | 'neutral'
                    impact_on_career?: 'helped' | 'hindered' | 'neutral' | null
                    description?: string | null
                    notes?: Json
                    outcomes?: string | null
                    related_project_id?: string | null
                    related_goal_id?: string | null
                    related_challenge_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    coworker_id?: string
                    interaction_date?: string
                    interaction_type?: 'meeting' | 'conflict' | 'collaboration' | 'feedback' | 'casual' | 'email' | 'chat' | 'phone'
                    sentiment?: 'positive' | 'negative' | 'neutral'
                    impact_on_career?: 'helped' | 'hindered' | 'neutral' | null
                    description?: string | null
                    notes?: Json
                    outcomes?: string | null
                    related_project_id?: string | null
                    related_goal_id?: string | null
                    related_challenge_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            decisions: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    decision_date: string
                    reasoning: string | null
                    expected_outcome: string | null
                    actual_outcome: string | null
                    related_coworkers: Json
                    related_goals: Json
                    related_projects: Json
                    status: 'pending' | 'successful' | 'failed' | 'ongoing' | 'cancelled'
                    lessons_learned: string | null
                    impact_score: number | null
                    confidence_level: number | null
                    tags: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    decision_date?: string
                    reasoning?: string | null
                    expected_outcome?: string | null
                    actual_outcome?: string | null
                    related_coworkers?: Json
                    related_goals?: Json
                    related_projects?: Json
                    status?: 'pending' | 'successful' | 'failed' | 'ongoing' | 'cancelled'
                    lessons_learned?: string | null
                    impact_score?: number | null
                    confidence_level?: number | null
                    tags?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    decision_date?: string
                    reasoning?: string | null
                    expected_outcome?: string | null
                    actual_outcome?: string | null
                    related_coworkers?: Json
                    related_goals?: Json
                    related_projects?: Json
                    status?: 'pending' | 'successful' | 'failed' | 'ongoing' | 'cancelled'
                    lessons_learned?: string | null
                    impact_score?: number | null
                    confidence_level?: number | null
                    tags?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            meeting_preparations: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    meeting_date: string
                    attendees: Json
                    objectives: string | null
                    ai_briefing: Json
                    talking_points: Json
                    potential_conflicts: Json
                    opportunities: Json
                    notes: string | null
                    outcome: string | null
                    follow_up_actions: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    meeting_date: string
                    attendees?: Json
                    objectives?: string | null
                    ai_briefing?: Json
                    talking_points?: Json
                    potential_conflicts?: Json
                    opportunities?: Json
                    notes?: string | null
                    outcome?: string | null
                    follow_up_actions?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    meeting_date?: string
                    attendees?: Json
                    objectives?: string | null
                    ai_briefing?: Json
                    talking_points?: Json
                    potential_conflicts?: Json
                    opportunities?: Json
                    notes?: string | null
                    outcome?: string | null
                    follow_up_actions?: Json
                    created_at?: string
                    updated_at?: string
                }
                project_milestones: {
                    Row: {
                        id: string
                        project_id: string
                        user_id: string
                        title: string
                        description: string | null
                        due_date: string | null
                        completed: boolean
                        completed_at: string | null
                        order_index: number
                        deliverables: Json
                        created_at: string
                        updated_at: string
                    }
                    Insert: {
                        id?: string
                        project_id: string
                        user_id: string
                        title: string
                        description?: string | null
                        due_date?: string | null
                        completed?: boolean
                        completed_at?: string | null
                        order_index?: number
                        deliverables?: Json
                        created_at?: string
                        updated_at?: string
                    }
                    Update: {
                        id?: string
                        project_id?: string
                        user_id?: string
                        title?: string
                        description?: string | null
                        due_date?: string | null
                        completed?: boolean
                        completed_at?: string | null
                        order_index?: number
                        deliverables?: Json
                        created_at?: string
                        updated_at?: string
                    }
                }
                project_tasks: {
                    Row: {
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
                        tags: Json
                        dependencies: Json
                        blockers: string | null
                        order_index: number
                        created_at: string
                        updated_at: string
                    }
                    Insert: {
                        id?: string
                        project_id: string
                        milestone_id?: string | null
                        user_id: string
                        title: string
                        description?: string | null
                        status?: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
                        priority?: 'low' | 'medium' | 'high' | 'critical'
                        assigned_to?: string | null
                        due_date?: string | null
                        completed_at?: string | null
                        estimated_hours?: number | null
                        actual_hours?: number | null
                        tags?: Json
                        dependencies?: Json
                        blockers?: string | null
                        order_index?: number
                        created_at?: string
                        updated_at?: string
                    }
                    Update: {
                        id?: string
                        project_id?: string
                        milestone_id?: string | null
                        user_id?: string
                        title?: string
                        description?: string | null
                        status?: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
                        priority?: 'low' | 'medium' | 'high' | 'critical'
                        assigned_to?: string | null
                        due_date?: string | null
                        completed_at?: string | null
                        estimated_hours?: number | null
                        actual_hours?: number | null
                        tags?: Json
                        dependencies?: Json
                        blockers?: string | null
                        order_index?: number
                        created_at?: string
                        updated_at?: string
                    }
                }
                project_updates: {
                    Row: {
                        id: string
                        project_id: string
                        user_id: string
                        update_type: 'progress' | 'blocker' | 'milestone' | 'status_change' | 'note'
                        title: string
                        description: string | null
                        previous_value: string | null
                        new_value: string | null
                        impact: 'positive' | 'negative' | 'neutral' | null
                        created_at: string
                    }
                    Insert: {
                        id?: string
                        project_id: string
                        user_id: string
                        update_type: 'progress' | 'blocker' | 'milestone' | 'status_change' | 'note'
                        title: string
                        description?: string | null
                        previous_value?: string | null
                        new_value?: string | null
                        impact?: 'positive' | 'negative' | 'neutral' | null
                        created_at?: string
                    }
                    Update: {
                        id?: string
                        project_id?: string
                        user_id?: string
                        update_type?: 'progress' | 'blocker' | 'milestone' | 'status_change' | 'note'
                        title?: string
                        description?: string | null
                        previous_value?: string | null
                        new_value?: string | null
                        impact?: 'positive' | 'negative' | 'neutral' | null
                        created_at?: string
                    }
                }
                project_issues: {
                    Row: {
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
                        related_tasks: Json
                        created_at: string
                        updated_at: string
                    }
                    Insert: {
                        id?: string
                        project_id: string
                        user_id: string
                        title: string
                        description?: string | null
                        severity?: 'low' | 'medium' | 'high' | 'critical'
                        status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
                        category?: string | null
                        reported_date?: string
                        resolved_date?: string | null
                        resolution?: string | null
                        impact_on_timeline?: string | null
                        related_tasks?: Json
                        created_at?: string
                        updated_at?: string
                    }
                    Update: {
                        id?: string
                        project_id?: string
                        user_id?: string
                        title?: string
                        description?: string | null
                        severity?: 'low' | 'medium' | 'high' | 'critical'
                        status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
                        category?: string | null
                        reported_date?: string
                        resolved_date?: string | null
                        resolution?: string | null
                        impact_on_timeline?: string | null
                        related_tasks?: Json
                        created_at?: string
                        updated_at?: string
                    }
                }
            }
        }
    }
}
