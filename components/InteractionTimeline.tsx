'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface Interaction {
    id: string
    interaction_date: string
    interaction_type: string
    sentiment: 'positive' | 'negative' | 'neutral'
    impact_on_career: string | null
    description: string | null
    outcomes: string | null
}

interface InteractionTimelineProps {
    interactions: Interaction[]
    coworkerId: string
    onInteractionAdded?: () => void
}

export default function InteractionTimeline({ interactions, coworkerId, onInteractionAdded }: InteractionTimelineProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newInteraction, setNewInteraction] = useState({
        interaction_type: 'meeting',
        sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
        impact_on_career: 'neutral',
        description: '',
        outcomes: '',
        interaction_date: new Date().toISOString().split('T')[0]
    })

    const handleAddInteraction = async () => {
        try {
            const response = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coworker_id: coworkerId,
                    ...newInteraction
                })
            })

            if (response.ok) {
                setIsAddDialogOpen(false)
                setNewInteraction({
                    interaction_type: 'meeting',
                    sentiment: 'neutral',
                    impact_on_career: 'neutral',
                    description: '',
                    outcomes: '',
                    interaction_date: new Date().toISOString().split('T')[0]
                })
                onInteractionAdded?.()
            }
        } catch (error) {
            console.error('Error adding interaction:', error)
        }
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'negative': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'meeting': return '📅'
            case 'conflict': return '⚠️'
            case 'collaboration': return '🤝'
            case 'feedback': return '💬'
            case 'casual': return '☕'
            case 'email': return '📧'
            case 'chat': return '💭'
            case 'phone': return '📞'
            default: return '📝'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Interaction History</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">Log Interaction</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Log New Interaction</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newInteraction.interaction_date}
                                    onChange={(e) => setNewInteraction({ ...newInteraction, interaction_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Interaction Type</Label>
                                <Select
                                    value={newInteraction.interaction_type}
                                    onValueChange={(value) => setNewInteraction({ ...newInteraction, interaction_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="conflict">Conflict</SelectItem>
                                        <SelectItem value="collaboration">Collaboration</SelectItem>
                                        <SelectItem value="feedback">Feedback</SelectItem>
                                        <SelectItem value="casual">Casual</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="chat">Chat</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="sentiment">Sentiment</Label>
                                <Select
                                    value={newInteraction.sentiment}
                                    onValueChange={(value: 'positive' | 'negative' | 'neutral') => setNewInteraction({ ...newInteraction, sentiment: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="positive">Positive</SelectItem>
                                        <SelectItem value="neutral">Neutral</SelectItem>
                                        <SelectItem value="negative">Negative</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="impact">Career Impact</Label>
                                <Select
                                    value={newInteraction.impact_on_career}
                                    onValueChange={(value) => setNewInteraction({ ...newInteraction, impact_on_career: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="helped">Helped</SelectItem>
                                        <SelectItem value="neutral">Neutral</SelectItem>
                                        <SelectItem value="hindered">Hindered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newInteraction.description}
                                    onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                                    placeholder="What happened during this interaction?"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="outcomes">Outcomes</Label>
                                <Textarea
                                    id="outcomes"
                                    value={newInteraction.outcomes}
                                    onChange={(e) => setNewInteraction({ ...newInteraction, outcomes: e.target.value })}
                                    placeholder="What were the results?"
                                    rows={2}
                                />
                            </div>
                            <Button onClick={handleAddInteraction} className="w-full">
                                Log Interaction
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {interactions.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500 mb-4">No interactions logged yet</p>
                    <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                        Log First Interaction
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {interactions.map((interaction) => (
                        <Card key={interaction.id} className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">{getTypeIcon(interaction.interaction_type)}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium capitalize">{interaction.interaction_type}</span>
                                        <Badge className={getSentimentColor(interaction.sentiment)}>
                                            {interaction.sentiment}
                                        </Badge>
                                        {interaction.impact_on_career && (
                                            <Badge variant="outline" className="text-xs">
                                                {interaction.impact_on_career}
                                            </Badge>
                                        )}
                                        <span className="text-sm text-gray-500 ml-auto">
                                            {formatDate(interaction.interaction_date)}
                                        </span>
                                    </div>
                                    {interaction.description && (
                                        <p className="text-sm text-gray-700 mb-2">{interaction.description}</p>
                                    )}
                                    {interaction.outcomes && (
                                        <p className="text-sm text-gray-600 italic">
                                            <strong>Outcomes:</strong> {interaction.outcomes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
