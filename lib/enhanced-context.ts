/**
 * Enhanced Context Retrieval System
 * Intelligently fetches and prioritizes user context based on message intent
 */

import { createClient } from '@/lib/supabase/server'
import { analyzeIntent, getDataSourceLimit, getDataSourcePriority } from './context-analyzer'
import { scoreAndSortItems, getWeightsForPriority, ScoredItem } from './relevance-scorer'
import type { Database } from './types/database'

type Tables = Database['public']['Tables']

export interface EnhancedUserContext {
    profile: Tables['career_profiles']['Row'] | null
    skills: ScoredItem<Tables['skills']['Row']>[]
    goals: ScoredItem<Tables['goals']['Row']>[]
    projects: ScoredItem<Tables['projects']['Row']>[]
    coworkers: ScoredItem<Tables['coworkers']['Row']>[]
    challenges: ScoredItem<Tables['challenges']['Row']>[]
    achievements: ScoredItem<Tables['achievements']['Row']>[]
    interactions: ScoredItem<Tables['coworker_interactions']['Row']>[]
    decisions: ScoredItem<Tables['decisions']['Row']>[]
    conversationStats: {
        totalConversations: number
        recentTopics: string[]
        mentionCounts: Map<string, number>
    }
    intentAnalysis: ReturnType<typeof analyzeIntent>
}

/**
 * Get conversation statistics for frequency scoring
 */
async function getConversationStats(userId: string) {
    const supabase = await createClient()

    // Get total conversation count
    const { count: totalConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    // Get recent conversation topics (last 10 conversations)
    const { data: recentConvs } = await supabase
        .from('conversations')
        .select('title, messages')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10)

    const recentTopics = recentConvs?.map(c => c.title).filter(Boolean) || []

    // TODO: In future, track mention counts in a separate table for efficiency
    // For now, return empty map (frequency scoring will use default values)
    const mentionCounts = new Map<string, number>()

    return {
        totalConversations: totalConversations || 1,
        recentTopics,
        mentionCounts
    }
}

/**
 * Fetch and score skills based on relevance
 */
async function fetchScoredSkills(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(50) // Fetch more than needed for scoring

    if (!skills || skills.length === 0) return []

    return scoreAndSortItems(skills, userMessage, keywords, {
        dateField: 'updated_at',
        textFields: ['name', 'category'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score goals based on relevance
 */
async function fetchScoredGoals(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'ongoing'])
        .order('updated_at', { ascending: false })
        .limit(30)

    if (!goals || goals.length === 0) return []

    return scoreAndSortItems(goals, userMessage, keywords, {
        dateField: 'updated_at',
        textFields: ['title', 'description', 'category'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score projects based on relevance
 */
async function fetchScoredProjects(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .limit(30)

    if (!projects || projects.length === 0) return []

    return scoreAndSortItems(projects, userMessage, keywords, {
        dateField: 'start_date',
        textFields: ['name', 'description'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score coworkers based on relevance
 */
async function fetchScoredCoworkers(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: coworkers } = await supabase
        .from('coworkers')
        .select('*')
        .eq('user_id', userId)
        .order('last_interaction_date', { ascending: false, nullsFirst: false })
        .limit(40)

    if (!coworkers || coworkers.length === 0) return []

    return scoreAndSortItems(coworkers, userMessage, keywords, {
        dateField: 'last_interaction_date',
        textFields: ['name', 'role', 'department', 'relationship'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score challenges based on relevance
 */
async function fetchScoredChallenges(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'ongoing'])
        .order('updated_at', { ascending: false })
        .limit(20)

    if (!challenges || challenges.length === 0) return []

    return scoreAndSortItems(challenges, userMessage, keywords, {
        dateField: 'updated_at',
        textFields: ['title', 'description', 'category'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score achievements based on relevance
 */
async function fetchScoredAchievements(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_date', { ascending: false, nullsFirst: false })
        .limit(20)

    if (!achievements || achievements.length === 0) return []

    return scoreAndSortItems(achievements, userMessage, keywords, {
        dateField: 'achieved_date',
        textFields: ['title', 'description'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score interactions based on relevance
 */
async function fetchScoredInteractions(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: interactions } = await supabase
        .from('coworker_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('interaction_date', { ascending: false })
        .limit(30)

    if (!interactions || interactions.length === 0) return []

    return scoreAndSortItems(interactions, userMessage, keywords, {
        dateField: 'interaction_date',
        textFields: ['description', 'outcomes'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Fetch and score decisions based on relevance
 */
async function fetchScoredDecisions(
    userId: string,
    userMessage: string,
    keywords: string[],
    limit: number,
    priority: 'high' | 'medium' | 'low',
    stats: Awaited<ReturnType<typeof getConversationStats>>
) {
    const supabase = await createClient()

    const { data: decisions } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'ongoing'])
        .order('decision_date', { ascending: false })
        .limit(20)

    if (!decisions || decisions.length === 0) return []

    return scoreAndSortItems(decisions, userMessage, keywords, {
        dateField: 'decision_date',
        textFields: ['title', 'description', 'reasoning'],
        weights: getWeightsForPriority(priority),
        limit,
        mentionCounts: stats.mentionCounts,
        totalConversations: stats.totalConversations
    })
}

/**
 * Main function to get enhanced user context
 */
export async function getEnhancedUserContext(
    userId: string,
    userMessage: string
): Promise<EnhancedUserContext> {
    const supabase = await createClient()

    // Analyze user message intent
    const intentAnalysis = analyzeIntent(userMessage)

    // Get conversation statistics
    const stats = await getConversationStats(userId)

    // Fetch profile (always needed)
    const { data: profile } = await supabase
        .from('career_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

    // Fetch data sources based on intent analysis
    const [
        skills,
        goals,
        projects,
        coworkers,
        challenges,
        achievements,
        interactions,
        decisions
    ] = await Promise.all([
        fetchScoredSkills(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('skills', intentAnalysis),
            getDataSourcePriority('skills', intentAnalysis),
            stats
        ),
        fetchScoredGoals(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('goals', intentAnalysis),
            getDataSourcePriority('goals', intentAnalysis),
            stats
        ),
        fetchScoredProjects(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('projects', intentAnalysis),
            getDataSourcePriority('projects', intentAnalysis),
            stats
        ),
        fetchScoredCoworkers(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('coworkers', intentAnalysis),
            getDataSourcePriority('coworkers', intentAnalysis),
            stats
        ),
        fetchScoredChallenges(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('challenges', intentAnalysis),
            getDataSourcePriority('challenges', intentAnalysis),
            stats
        ),
        fetchScoredAchievements(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('achievements', intentAnalysis),
            getDataSourcePriority('achievements', intentAnalysis),
            stats
        ),
        fetchScoredInteractions(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('interactions', intentAnalysis),
            getDataSourcePriority('interactions', intentAnalysis),
            stats
        ),
        fetchScoredDecisions(
            userId,
            userMessage,
            intentAnalysis.keywords,
            getDataSourceLimit('decisions', intentAnalysis),
            getDataSourcePriority('decisions', intentAnalysis),
            stats
        )
    ])

    return {
        profile: profile || null,
        skills,
        goals,
        projects,
        coworkers,
        challenges,
        achievements,
        interactions,
        decisions,
        conversationStats: stats,
        intentAnalysis
    }
}
