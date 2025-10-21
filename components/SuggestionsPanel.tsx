'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Sparkles,
    BookOpen,
    Target,
    FolderKanban,
    AlertCircle,
    Award,
    User,
    Check,
    X,
    Loader2,
    Users,
    MessageSquare,
    GitBranch
} from 'lucide-react'

interface Suggestion {
    id: string
    entity_type: 'skill' | 'skill_update' | 'goal' | 'project' | 'challenge' | 'achievement' | 'profile_update' | 'coworker' | 'interaction' | 'decision'
    entity_data: any
    context: string
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

interface SuggestionsPanelProps {
    conversationId?: string
}

export default function SuggestionsPanel({ conversationId }: SuggestionsPanelProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchSuggestions()
    }, [conversationId])

    const fetchSuggestions = async () => {
        try {
            setLoading(true)
            const url = conversationId
                ? `/api/suggestions?conversationId=${conversationId}`
                : '/api/suggestions'

            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setSuggestions(data.suggestions || [])
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (suggestionId: string, action: 'accept' | 'reject') => {
        try {
            // Optimistically remove the suggestion immediately for better UX
            setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
            setProcessingId(suggestionId)

            const response = await fetch(`/api/suggestions/${suggestionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (!response.ok) {
                console.error('Failed to process suggestion')
                // Optionally: re-fetch suggestions to restore state on error
                fetchSuggestions()
            }
        } catch (error) {
            console.error('Error processing suggestion:', error)
            // Optionally: re-fetch suggestions to restore state on error
            fetchSuggestions()
        } finally {
            setProcessingId(null)
        }
    }

    const getEntityTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            skill: 'New Skill',
            skill_update: 'Skill Update',
            goal: 'Goal',
            project: 'Project',
            challenge: 'Challenge',
            achievement: 'Achievement',
            profile_update: 'Profile Update',
            coworker: 'Co-worker',
            interaction: 'Interaction',
            decision: 'Decision'
        }
        return labels[type] || type
    }

    const getEntityIcon = (type: string) => {
        const icons: Record<string, any> = {
            skill: BookOpen,
            skill_update: BookOpen,
            goal: Target,
            project: FolderKanban,
            challenge: AlertCircle,
            achievement: Award,
            profile_update: User,
            coworker: Users,
            interaction: MessageSquare,
            decision: GitBranch
        }
        const Icon = icons[type] || Sparkles
        return <Icon className="w-4 h-4" />
    }

    const getEntityColor = (type: string) => {
        const colors: Record<string, string> = {
            skill: 'bg-blue-50 text-blue-700 border-blue-200',
            skill_update: 'bg-blue-50 text-blue-700 border-blue-200',
            goal: 'bg-green-50 text-green-700 border-green-200',
            project: 'bg-purple-50 text-purple-700 border-purple-200',
            challenge: 'bg-orange-50 text-orange-700 border-orange-200',
            achievement: 'bg-amber-50 text-amber-700 border-amber-200',
            profile_update: 'bg-gray-50 text-gray-700 border-gray-200',
            coworker: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            interaction: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            decision: 'bg-violet-50 text-violet-700 border-violet-200'
        }
        return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200'
    }

    const getEntityTitle = (suggestion: Suggestion) => {
        const data = suggestion.entity_data
        switch (suggestion.entity_type) {
            case 'skill':
                return data.skill_name
            case 'skill_update':
                return data.skill_name
            case 'goal':
            case 'project':
            case 'challenge':
            case 'achievement':
            case 'decision':
                return data.title || data.project_name
            case 'profile_update':
                return `Update ${data.field?.replace('_', ' ') || 'profile'}`
            case 'coworker':
                return data.name
            case 'interaction':
                return `Interaction with ${data.coworker_name}`
            default:
                return 'Update'
        }
    }

    const getEntityDescription = (suggestion: Suggestion) => {
        const data = suggestion.entity_data
        switch (suggestion.entity_type) {
            case 'skill':
                return `${data.category} • Proficiency: ${data.proficiency_level}/5`
            case 'skill_update':
                return `Update proficiency to: ${data.proficiency_level}/5`
            case 'goal':
            case 'project':
            case 'challenge':
            case 'achievement':
            case 'decision':
                return data.description
            case 'profile_update':
                return `New value: ${Array.isArray(data.value) ? data.value.join(', ') : data.value}`
            case 'coworker':
                return `${data.role || 'Co-worker'}${data.department ? ` • ${data.department}` : ''}`
            case 'interaction':
                return data.description || `${data.interaction_type} interaction`
            default:
                return ''
        }
    }

    if (loading) {
        return (
            <div className="border-t border-gray-200 bg-gradient-to-b from-blue-50/50 to-white p-6">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading suggestions...</span>
                </div>
            </div>
        )
    }

    if (suggestions.length === 0) {
        return null
    }

    return (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold mb-3">
                Suggested Updates ({suggestions.length})
            </h3>
            <div className="space-y-3">
                {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {getEntityTypeLabel(suggestion.entity_type)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                        {getEntityTitle(suggestion)}
                                    </span>
                                </div>
                                {getEntityDescription(suggestion) && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        {getEntityDescription(suggestion)}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 italic">
                                    "{suggestion.context}"
                                </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAction(suggestion.id, 'reject')}
                                    disabled={processingId === suggestion.id}
                                    className="h-8 px-3 text-xs"
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(suggestion.id, 'accept')}
                                    disabled={processingId === suggestion.id}
                                    className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                                >
                                    {processingId === suggestion.id ? 'Adding...' : 'Add'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
