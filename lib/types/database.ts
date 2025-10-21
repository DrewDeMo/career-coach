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
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    status: 'active' | 'completed' | 'on-hold' | 'cancelled'
                    description: string | null
                    technologies: Json
                    start_date: string | null
                    end_date: string | null
                    team_members: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    status?: 'active' | 'completed' | 'on-hold' | 'cancelled'
                    description?: string | null
                    technologies?: Json
                    start_date?: string | null
                    end_date?: string | null
                    team_members?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    status?: 'active' | 'completed' | 'on-hold' | 'cancelled'
                    description?: string | null
                    technologies?: Json
                    start_date?: string | null
                    end_date?: string | null
                    team_members?: Json
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
        }
    }
}
