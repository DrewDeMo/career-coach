/**
 * Context Analyzer - Determines what data to fetch based on user message intent
 * Uses keyword matching and semantic analysis to identify relevant data sources
 */

export type IntentCategory =
    | 'skills_learning'
    | 'career_goals'
    | 'relationships'
    | 'challenges_obstacles'
    | 'decision_making'
    | 'achievements_progress'
    | 'general_coaching'

export interface IntentAnalysis {
    primary: IntentCategory
    secondary: IntentCategory[]
    confidence: number
    keywords: string[]
    dataSources: DataSource[]
}

export interface DataSource {
    name: string
    priority: 'high' | 'medium' | 'low'
    limit: number
}

// Keyword patterns for each intent category
const INTENT_PATTERNS = {
    skills_learning: {
        keywords: [
            'learn', 'skill', 'training', 'course', 'certification', 'improve',
            'practice', 'study', 'master', 'proficiency', 'expertise', 'knowledge',
            'technology', 'framework', 'language', 'tool', 'develop', 'growth'
        ],
        dataSources: [
            { name: 'skills', priority: 'high' as const, limit: 15 },
            { name: 'achievements', priority: 'high' as const, limit: 5 },
            { name: 'goals', priority: 'medium' as const, limit: 5 },
            { name: 'projects', priority: 'medium' as const, limit: 5 },
            { name: 'challenges', priority: 'low' as const, limit: 3 }
        ]
    },
    career_goals: {
        keywords: [
            'goal', 'career', 'promotion', 'advance', 'grow', 'future', 'plan',
            'aspire', 'ambition', 'objective', 'target', 'achieve', 'progress',
            'next step', 'move up', 'transition', 'change role', 'senior', 'lead'
        ],
        dataSources: [
            { name: 'goals', priority: 'high' as const, limit: 8 },
            { name: 'projects', priority: 'high' as const, limit: 8 },
            { name: 'achievements', priority: 'medium' as const, limit: 5 },
            { name: 'decisions', priority: 'medium' as const, limit: 5 },
            { name: 'skills', priority: 'low' as const, limit: 10 }
        ]
    },
    relationships: {
        keywords: [
            'coworker', 'colleague', 'team', 'manager', 'boss', 'relationship',
            'communication', 'conflict', 'collaborate', 'work with', 'meeting',
            'feedback', 'interaction', 'people', 'person', 'someone', 'they',
            'list', 'show', 'who are'
        ],
        dataSources: [
            { name: 'coworkers', priority: 'high' as const, limit: 50 },
            { name: 'interactions', priority: 'high' as const, limit: 10 },
            { name: 'decisions', priority: 'medium' as const, limit: 5 },
            { name: 'challenges', priority: 'medium' as const, limit: 5 },
            { name: 'projects', priority: 'low' as const, limit: 5 }
        ]
    },
    challenges_obstacles: {
        keywords: [
            'challenge', 'problem', 'issue', 'struggle', 'difficult', 'hard',
            'obstacle', 'stuck', 'blocked', 'frustrated', 'overwhelmed', 'stress',
            'concern', 'worry', 'trouble', 'help', 'advice', 'not sure'
        ],
        dataSources: [
            { name: 'challenges', priority: 'high' as const, limit: 8 },
            { name: 'interactions', priority: 'high' as const, limit: 8 },
            { name: 'decisions', priority: 'medium' as const, limit: 5 },
            { name: 'coworkers', priority: 'medium' as const, limit: 8 },
            { name: 'goals', priority: 'low' as const, limit: 5 }
        ]
    },
    decision_making: {
        keywords: [
            'decide', 'decision', 'choice', 'option', 'should i', 'consider',
            'thinking about', 'evaluate', 'weigh', 'pros and cons', 'whether',
            'if i should', 'opportunity', 'offer', 'job offer', 'switch'
        ],
        dataSources: [
            { name: 'decisions', priority: 'high' as const, limit: 8 },
            { name: 'goals', priority: 'high' as const, limit: 8 },
            { name: 'coworkers', priority: 'medium' as const, limit: 10 },
            { name: 'interactions', priority: 'medium' as const, limit: 8 },
            { name: 'projects', priority: 'low' as const, limit: 5 }
        ]
    },
    achievements_progress: {
        keywords: [
            'achieved', 'accomplished', 'completed', 'finished', 'success',
            'milestone', 'progress', 'improved', 'better', 'proud', 'won',
            'delivered', 'shipped', 'launched', 'recognition', 'award'
        ],
        dataSources: [
            { name: 'achievements', priority: 'high' as const, limit: 8 },
            { name: 'projects', priority: 'high' as const, limit: 8 },
            { name: 'goals', priority: 'medium' as const, limit: 8 },
            { name: 'skills', priority: 'medium' as const, limit: 10 },
            { name: 'interactions', priority: 'low' as const, limit: 5 }
        ]
    },
    general_coaching: {
        keywords: [],
        dataSources: [
            { name: 'goals', priority: 'high' as const, limit: 5 },
            { name: 'skills', priority: 'high' as const, limit: 10 },
            { name: 'projects', priority: 'medium' as const, limit: 5 },
            { name: 'coworkers', priority: 'medium' as const, limit: 20 },
            { name: 'challenges', priority: 'medium' as const, limit: 3 },
            { name: 'achievements', priority: 'low' as const, limit: 3 },
            { name: 'interactions', priority: 'low' as const, limit: 5 },
            { name: 'decisions', priority: 'low' as const, limit: 3 }
        ]
    }
}

/**
 * Analyzes user message to determine intent and relevant data sources
 */
export function analyzeIntent(message: string): IntentAnalysis {
    const lowerMessage = message.toLowerCase()
    const scores: Record<IntentCategory, number> = {
        skills_learning: 0,
        career_goals: 0,
        relationships: 0,
        challenges_obstacles: 0,
        decision_making: 0,
        achievements_progress: 0,
        general_coaching: 0
    }

    const matchedKeywords: string[] = []

    // Score each intent category based on keyword matches
    for (const [category, config] of Object.entries(INTENT_PATTERNS)) {
        if (category === 'general_coaching') continue

        for (const keyword of config.keywords) {
            if (lowerMessage.includes(keyword)) {
                scores[category as IntentCategory]++
                if (!matchedKeywords.includes(keyword)) {
                    matchedKeywords.push(keyword)
                }
            }
        }
    }

    // Find primary intent (highest score)
    let primary: IntentCategory = 'general_coaching'
    let maxScore = 0

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score
            primary = category as IntentCategory
        }
    }

    // Find secondary intents (scores > 0 but not primary)
    const secondary: IntentCategory[] = []
    for (const [category, score] of Object.entries(scores)) {
        if (score > 0 && category !== primary) {
            secondary.push(category as IntentCategory)
        }
    }

    // Sort secondary by score
    secondary.sort((a, b) => scores[b] - scores[a])

    // Calculate confidence (0-1)
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0)
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.5

    // Get data sources for primary intent
    const dataSources = INTENT_PATTERNS[primary].dataSources

    // Merge in high-priority data sources from secondary intents
    const secondaryDataSources = new Map<string, DataSource>()
    for (const intent of secondary.slice(0, 2)) { // Top 2 secondary intents
        for (const ds of INTENT_PATTERNS[intent].dataSources) {
            if (ds.priority === 'high' && !dataSources.find(d => d.name === ds.name)) {
                secondaryDataSources.set(ds.name, { ...ds, priority: 'medium' })
            }
        }
    }

    const allDataSources = [
        ...dataSources,
        ...Array.from(secondaryDataSources.values())
    ]

    return {
        primary,
        secondary: secondary.slice(0, 2), // Keep top 2 secondary intents
        confidence,
        keywords: matchedKeywords,
        dataSources: allDataSources
    }
}

/**
 * Determines if a data source should be fetched based on intent analysis
 */
export function shouldFetchDataSource(
    dataSourceName: string,
    intentAnalysis: IntentAnalysis
): boolean {
    return intentAnalysis.dataSources.some(ds => ds.name === dataSourceName)
}

/**
 * Gets the limit for a specific data source based on intent analysis
 */
export function getDataSourceLimit(
    dataSourceName: string,
    intentAnalysis: IntentAnalysis
): number {
    const dataSource = intentAnalysis.dataSources.find(ds => ds.name === dataSourceName)
    return dataSource?.limit || 5 // Default limit
}

/**
 * Gets priority for a data source
 */
export function getDataSourcePriority(
    dataSourceName: string,
    intentAnalysis: IntentAnalysis
): 'high' | 'medium' | 'low' {
    const dataSource = intentAnalysis.dataSources.find(ds => ds.name === dataSourceName)
    return dataSource?.priority || 'low'
}
