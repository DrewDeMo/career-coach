/**
 * Relevance Scorer - Scores and prioritizes context data
 * Uses recency, frequency, and semantic relevance to rank items
 */

export interface ScoredItem<T> {
    item: T
    score: number
    breakdown: {
        recency: number
        frequency: number
        semantic: number
    }
}

export interface ScoringWeights {
    recency: number      // 0-1, default 0.4
    frequency: number    // 0-1, default 0.3
    semantic: number     // 0-1, default 0.3
}

const DEFAULT_WEIGHTS: ScoringWeights = {
    recency: 0.4,
    frequency: 0.3,
    semantic: 0.3
}

/**
 * Calculate days since a date
 */
function daysSince(date: Date | string): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - dateObj.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate recency score (0-100)
 * More recent = higher score
 */
export function calculateRecencyScore(date: Date | string | null | undefined): number {
    if (!date) return 20 // Default low score for items without dates

    const days = daysSince(date)

    // Exponential decay scoring
    if (days <= 7) return 100      // Last week: full score
    if (days <= 14) return 90      // Last 2 weeks: 90%
    if (days <= 30) return 75      // Last month: 75%
    if (days <= 60) return 55      // Last 2 months: 55%
    if (days <= 90) return 40      // Last quarter: 40%
    if (days <= 180) return 25     // Last 6 months: 25%
    return 10                       // Older: 10%
}

/**
 * Calculate frequency score (0-100)
 * Based on how often an item is referenced in conversations
 */
export function calculateFrequencyScore(
    mentionCount: number,
    totalConversations: number
): number {
    if (totalConversations === 0) return 50 // Default mid score

    const frequency = mentionCount / totalConversations

    // Logarithmic scaling for frequency
    if (frequency >= 0.5) return 100       // Mentioned in 50%+ of conversations
    if (frequency >= 0.3) return 85        // 30-50%
    if (frequency >= 0.2) return 70        // 20-30%
    if (frequency >= 0.1) return 55        // 10-20%
    if (frequency >= 0.05) return 40       // 5-10%
    return Math.max(20, frequency * 400)   // < 5%, scaled
}

/**
 * Calculate semantic relevance score (0-100)
 * Based on keyword matching between item and user message
 */
export function calculateSemanticScore(
    itemText: string,
    userMessage: string,
    keywords: string[] = []
): number {
    const lowerItem = itemText.toLowerCase()
    const lowerMessage = userMessage.toLowerCase()

    let score = 0
    let matches = 0

    // Check for direct keyword matches
    for (const keyword of keywords) {
        if (lowerItem.includes(keyword) || lowerMessage.includes(keyword)) {
            matches++
            score += 15 // Each keyword match adds 15 points
        }
    }

    // Check for word overlap between item and message
    const itemWords = lowerItem.split(/\s+/).filter(w => w.length > 3)
    const messageWords = new Set(lowerMessage.split(/\s+/).filter(w => w.length > 3))

    for (const word of itemWords) {
        if (messageWords.has(word)) {
            matches++
            score += 5 // Each word match adds 5 points
        }
    }

    // Bonus for multiple matches
    if (matches >= 5) score += 20
    else if (matches >= 3) score += 10

    return Math.min(100, score)
}

/**
 * Calculate composite score for an item
 */
export function calculateCompositeScore(
    recencyScore: number,
    frequencyScore: number,
    semanticScore: number,
    weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
    return (
        recencyScore * weights.recency +
        frequencyScore * weights.frequency +
        semanticScore * weights.semantic
    )
}

/**
 * Score a single item with all factors
 */
export function scoreItem<T extends Record<string, any>>(
    item: T,
    userMessage: string,
    keywords: string[],
    mentionCount: number = 0,
    totalConversations: number = 1,
    dateField: keyof T = 'created_at' as keyof T,
    textFields: (keyof T)[] = [],
    weights: ScoringWeights = DEFAULT_WEIGHTS
): ScoredItem<T> {
    // Calculate individual scores
    const recencyScore = calculateRecencyScore(item[dateField] as any)
    const frequencyScore = calculateFrequencyScore(mentionCount, totalConversations)

    // Combine text from multiple fields for semantic analysis
    const itemText = textFields
        .map(field => item[field])
        .filter(Boolean)
        .join(' ')
    const semanticScore = calculateSemanticScore(itemText, userMessage, keywords)

    // Calculate composite score
    const score = calculateCompositeScore(
        recencyScore,
        frequencyScore,
        semanticScore,
        weights
    )

    return {
        item,
        score,
        breakdown: {
            recency: recencyScore,
            frequency: frequencyScore,
            semantic: semanticScore
        }
    }
}

/**
 * Score and sort an array of items
 */
export function scoreAndSortItems<T extends Record<string, any>>(
    items: T[],
    userMessage: string,
    keywords: string[],
    options: {
        dateField?: keyof T
        textFields?: (keyof T)[]
        weights?: ScoringWeights
        limit?: number
        mentionCounts?: Map<string, number>
        totalConversations?: number
        customScoreBoost?: (item: T) => number
    } = {}
): ScoredItem<T>[] {
    const {
        dateField = 'created_at' as keyof T,
        textFields = [],
        weights = DEFAULT_WEIGHTS,
        limit,
        mentionCounts = new Map(),
        totalConversations = 1,
        customScoreBoost
    } = options

    // Score all items
    const scoredItems = items.map(item => {
        const itemId = item.id || item.name || JSON.stringify(item)
        const mentionCount = mentionCounts.get(itemId) || 0

        const scored = scoreItem(
            item,
            userMessage,
            keywords,
            mentionCount,
            totalConversations,
            dateField,
            textFields,
            weights
        )

        // Apply custom score boost if provided
        if (customScoreBoost) {
            const boost = customScoreBoost(item)
            scored.score = Math.min(100, scored.score + (boost * 100))
        }

        return scored
    })

    // Sort by score (highest first)
    scoredItems.sort((a, b) => b.score - a.score)

    // Apply limit if specified
    return limit ? scoredItems.slice(0, limit) : scoredItems
}

/**
 * Get temporal weight for time-based filtering
 * Used to emphasize recent data
 */
export function getTemporalWeight(date: Date | string | null | undefined): number {
    if (!date) return 0.2

    const days = daysSince(date)

    if (days <= 7) return 1.0      // Last week: full weight
    if (days <= 30) return 0.8     // Last month: 80%
    if (days <= 90) return 0.5     // Last quarter: 50%
    if (days <= 180) return 0.3    // Last 6 months: 30%
    return 0.2                      // Older: 20%
}

/**
 * Filter items by minimum score threshold
 */
export function filterByMinScore<T>(
    scoredItems: ScoredItem<T>[],
    minScore: number = 30
): ScoredItem<T>[] {
    return scoredItems.filter(item => item.score >= minScore)
}

/**
 * Get top N items by score
 */
export function getTopItems<T>(
    scoredItems: ScoredItem<T>[],
    n: number
): ScoredItem<T>[] {
    return scoredItems.slice(0, n)
}

/**
 * Adjust weights based on intent priority
 */
export function getWeightsForPriority(
    priority: 'high' | 'medium' | 'low'
): ScoringWeights {
    switch (priority) {
        case 'high':
            // Emphasize semantic relevance for high priority
            return { recency: 0.3, frequency: 0.2, semantic: 0.5 }
        case 'medium':
            // Balanced approach
            return DEFAULT_WEIGHTS
        case 'low':
            // Emphasize recency for low priority (get latest info)
            return { recency: 0.6, frequency: 0.2, semantic: 0.2 }
    }
}
