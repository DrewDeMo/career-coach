/**
 * Conversation Memory System
 * Tracks patterns, themes, and progress across conversations
 */

import { createClient } from '@/lib/supabase/server'

export interface ConversationPattern {
    theme: string
    frequency: number
    firstMentioned: string
    lastMentioned: string
    relatedTopics: string[]
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
}

export interface ProgressTracking {
    area: string
    status: 'improving' | 'stable' | 'declining' | 'new'
    evidence: string[]
    timeframe: string
}

export interface ConversationMemory {
    recurringThemes: ConversationPattern[]
    recentProgress: ProgressTracking[]
    ongoingChallenges: string[]
    conversationSummary: string
    totalConversations: number
    lastConversationDate: string | null
}

/**
 * Extract themes from conversation messages
 */
function extractThemes(messages: any[]): Map<string, number> {
    const themes = new Map<string, number>()

    // Common career themes to track
    const themeKeywords = {
        'work-life balance': ['work life', 'balance', 'burnout', 'stress', 'overwhelm', 'time management'],
        'career growth': ['promotion', 'advance', 'grow', 'next level', 'senior', 'lead'],
        'skill development': ['learn', 'skill', 'training', 'course', 'improve', 'practice'],
        'team dynamics': ['team', 'colleague', 'coworker', 'manager', 'relationship'],
        'job search': ['job', 'interview', 'resume', 'application', 'offer', 'switch'],
        'leadership': ['lead', 'manage', 'mentor', 'delegate', 'decision'],
        'communication': ['communicate', 'present', 'speak', 'meeting', 'feedback'],
        'confidence': ['confident', 'imposter', 'doubt', 'anxiety', 'worry'],
        'technical skills': ['code', 'programming', 'technology', 'framework', 'tool'],
        'project management': ['project', 'deadline', 'deliver', 'scope', 'timeline']
    }

    for (const msg of messages) {
        if (!msg.content) continue
        const content = msg.content.toLowerCase()

        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            for (const keyword of keywords) {
                if (content.includes(keyword)) {
                    themes.set(theme, (themes.get(theme) || 0) + 1)
                    break // Count once per message per theme
                }
            }
        }
    }

    return themes
}

/**
 * Analyze sentiment of messages
 */
function analyzeSentiment(messages: any[]): 'positive' | 'negative' | 'neutral' | 'mixed' {
    let positiveCount = 0
    let negativeCount = 0

    const positiveWords = ['success', 'achieve', 'accomplish', 'improve', 'better', 'great', 'excellent', 'proud', 'happy', 'excited']
    const negativeWords = ['struggle', 'difficult', 'hard', 'problem', 'issue', 'stress', 'worry', 'concern', 'frustrated', 'stuck']

    for (const msg of messages) {
        if (!msg.content) continue
        const content = msg.content.toLowerCase()

        for (const word of positiveWords) {
            if (content.includes(word)) positiveCount++
        }
        for (const word of negativeWords) {
            if (content.includes(word)) negativeCount++
        }
    }

    if (positiveCount > negativeCount * 1.5) return 'positive'
    if (negativeCount > positiveCount * 1.5) return 'negative'
    if (positiveCount > 0 && negativeCount > 0) return 'mixed'
    return 'neutral'
}

/**
 * Detect progress indicators in conversations
 */
function detectProgress(conversations: any[]): ProgressTracking[] {
    const progressAreas = new Map<string, { mentions: string[], dates: string[] }>()

    const progressKeywords = {
        'technical skills': ['learned', 'completed course', 'practiced', 'improved at', 'better at'],
        'leadership': ['led', 'managed', 'mentored', 'delegated', 'made decision'],
        'communication': ['presented', 'spoke', 'gave feedback', 'facilitated'],
        'relationships': ['built rapport', 'improved relationship', 'resolved conflict', 'collaborated'],
        'confidence': ['more confident', 'less anxious', 'overcame fear', 'took initiative']
    }

    for (const conv of conversations) {
        if (!conv.messages || !Array.isArray(conv.messages)) continue

        for (const msg of conv.messages) {
            if (!msg.content) continue
            const content = msg.content.toLowerCase()

            for (const [area, keywords] of Object.entries(progressKeywords)) {
                for (const keyword of keywords) {
                    if (content.includes(keyword)) {
                        if (!progressAreas.has(area)) {
                            progressAreas.set(area, { mentions: [], dates: [] })
                        }
                        const data = progressAreas.get(area)!
                        data.mentions.push(msg.content.substring(0, 100))
                        data.dates.push(conv.updated_at || conv.created_at)
                    }
                }
            }
        }
    }

    const progress: ProgressTracking[] = []
    for (const [area, data] of progressAreas.entries()) {
        if (data.mentions.length > 0) {
            // Determine status based on frequency and recency
            const recentMentions = data.dates.filter(date => {
                const days = Math.abs(new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
                return days <= 30
            }).length

            let status: ProgressTracking['status'] = 'stable'
            if (recentMentions >= 2) status = 'improving'
            else if (data.mentions.length === 1) status = 'new'

            progress.push({
                area,
                status,
                evidence: data.mentions.slice(0, 3),
                timeframe: `${data.mentions.length} mentions over ${Math.ceil((new Date().getTime() - new Date(data.dates[0]).getTime()) / (1000 * 60 * 60 * 24))} days`
            })
        }
    }

    return progress
}

/**
 * Identify ongoing challenges
 */
function identifyOngoingChallenges(conversations: any[]): string[] {
    const challenges = new Set<string>()

    const challengeKeywords = [
        'struggling with', 'having trouble', 'difficult to', 'challenge with',
        'problem with', 'stuck on', 'not sure how', 'need help with'
    ]

    for (const conv of conversations.slice(0, 10)) { // Last 10 conversations
        if (!conv.messages || !Array.isArray(conv.messages)) continue

        for (const msg of conv.messages) {
            if (msg.role !== 'user' || !msg.content) continue
            const content = msg.content.toLowerCase()

            for (const keyword of challengeKeywords) {
                const index = content.indexOf(keyword)
                if (index !== -1) {
                    // Extract the challenge (next 50 chars after keyword)
                    const challenge = content.substring(index, index + 70).trim()
                    challenges.add(challenge)
                }
            }
        }
    }

    return Array.from(challenges).slice(0, 5) // Top 5 challenges
}

/**
 * Generate conversation summary
 */
function generateConversationSummary(
    totalConversations: number,
    themes: Map<string, number>,
    progress: ProgressTracking[]
): string {
    let summary = `User has had ${totalConversations} coaching conversation${totalConversations !== 1 ? 's' : ''}. `

    if (themes.size > 0) {
        const topThemes = Array.from(themes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([theme]) => theme)
        summary += `Main focus areas: ${topThemes.join(', ')}. `
    }

    if (progress.length > 0) {
        const improving = progress.filter(p => p.status === 'improving')
        if (improving.length > 0) {
            summary += `Showing progress in: ${improving.map(p => p.area).join(', ')}. `
        }
    }

    return summary
}

/**
 * Get conversation memory for a user
 */
export async function getConversationMemory(userId: string): Promise<ConversationMemory> {
    const supabase = await createClient()

    // Fetch recent conversations (last 20)
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20)

    if (error || !conversations || conversations.length === 0) {
        return {
            recurringThemes: [],
            recentProgress: [],
            ongoingChallenges: [],
            conversationSummary: 'No previous conversations.',
            totalConversations: 0,
            lastConversationDate: null
        }
    }

    // Extract all messages from conversations
    const allMessages = conversations.flatMap(conv =>
        Array.isArray(conv.messages) ? conv.messages : []
    )

    // Analyze themes
    const themeFrequency = extractThemes(allMessages)
    const recurringThemes: ConversationPattern[] = []

    for (const [theme, frequency] of themeFrequency.entries()) {
        if (frequency >= 2) { // Only themes mentioned 2+ times
            // Find first and last mention
            let firstDate = null
            let lastDate = null

            for (const conv of conversations.reverse()) {
                const hasTheme = conv.messages?.some((msg: any) =>
                    msg.content?.toLowerCase().includes(theme.split(' ')[0])
                )
                if (hasTheme) {
                    if (!firstDate) firstDate = conv.created_at
                    lastDate = conv.updated_at || conv.created_at
                }
            }

            recurringThemes.push({
                theme,
                frequency,
                firstMentioned: firstDate || conversations[0].created_at,
                lastMentioned: lastDate || conversations[0].updated_at,
                relatedTopics: [], // Could be enhanced with topic modeling
                sentiment: analyzeSentiment(allMessages.filter((msg: any) =>
                    msg.content?.toLowerCase().includes(theme.split(' ')[0])
                ))
            })
        }
    }

    // Sort by frequency
    recurringThemes.sort((a, b) => b.frequency - a.frequency)

    // Detect progress
    const recentProgress = detectProgress(conversations)

    // Identify ongoing challenges
    const ongoingChallenges = identifyOngoingChallenges(conversations)

    // Generate summary
    const conversationSummary = generateConversationSummary(
        conversations.length,
        themeFrequency,
        recentProgress
    )

    return {
        recurringThemes: recurringThemes.slice(0, 5), // Top 5 themes
        recentProgress,
        ongoingChallenges,
        conversationSummary,
        totalConversations: conversations.length,
        lastConversationDate: conversations[0].updated_at || conversations[0].created_at
    }
}

/**
 * Build memory context string for system prompt
 */
export function buildMemoryContext(memory: ConversationMemory): string {
    if (memory.totalConversations === 0) {
        return '\n# Conversation History\nThis is your first conversation with this user.\n\n'
    }

    let context = '\n# Conversation History & Patterns\n\n'
    context += `**Overview**: ${memory.conversationSummary}\n\n`

    if (memory.recurringThemes.length > 0) {
        context += '**Recurring Themes**:\n'
        for (const theme of memory.recurringThemes) {
            context += `- ${theme.theme} (mentioned ${theme.frequency} times, ${theme.sentiment} sentiment)\n`
        }
        context += '\n'
    }

    if (memory.recentProgress.length > 0) {
        context += '**Recent Progress**:\n'
        for (const progress of memory.recentProgress) {
            context += `- ${progress.area}: ${progress.status} (${progress.timeframe})\n`
        }
        context += '\n'
    }

    if (memory.ongoingChallenges.length > 0) {
        context += '**Ongoing Challenges**:\n'
        for (const challenge of memory.ongoingChallenges.slice(0, 3)) {
            context += `- ${challenge}\n`
        }
        context += '\n'
    }

    context += '**Coaching Continuity**: Reference these patterns when relevant to show you remember and track their journey.\n\n'

    return context
}
