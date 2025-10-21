'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InteractionTimeline from '@/components/InteractionTimeline'

interface Coworker {
    id: string
    name: string
    role: string | null
    department: string | null
    seniority_level: string | null
    relationship: string | null
    communication_style: string | null
    influence_score: number | null
    relationship_quality: number | null
    trust_level: number | null
    career_impact: 'positive' | 'negative' | 'neutral' | null
    last_interaction_date: string | null
    interaction_frequency: string | null
    personality_traits: any
    working_style: any
    notes: any
}

interface Interaction {
    id: string
    interaction_date: string
    interaction_type: string
    sentiment: 'positive' | 'negative' | 'neutral'
    impact_on_career: string | null
    description: string | null
    outcomes: string | null
}

export default function CoworkerDetailPage() {
    const router = useRouter()
    const params = useParams()
    const coworkerId = params.id as string

    const [coworker, setCoworker] = useState<Coworker | null>(null)
    const [interactions, setInteractions] = useState<Interaction[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editData, setEditData] = useState<Partial<Coworker>>({})

    useEffect(() => {
        fetchCoworkerData()
    }, [coworkerId])

    const fetchCoworkerData = async () => {
        try {
            const response = await fetch(`/api/coworkers/${coworkerId}`)
            if (response.ok) {
                const data = await response.json()
                setCoworker(data.coworker)
                setInteractions(data.interactions)
                setEditData(data.coworker)
            }
        } catch (error) {
            console.error('Error fetching coworker:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/coworkers/${coworkerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            })

            if (response.ok) {
                setIsEditDialogOpen(false)
                fetchCoworkerData()
            }
        } catch (error) {
            console.error('Error updating coworker:', error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this co-worker? This will also delete all interactions.')) {
            return
        }

        try {
            const response = await fetch(`/api/coworkers/${coworkerId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                router.push('/coworkers')
            }
        } catch (error) {
            console.error('Error deleting coworker:', error)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getImpactColor = (impact: string | null) => {
        switch (impact) {
            case 'positive': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'negative': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        )
    }

    if (!coworker) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-500">Co-worker not found</p>
                    <Button onClick={() => router.push('/coworkers')} className="mt-4">
                        Back to Co-workers
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/coworkers')}
                        className="mb-4"
                    >
                        ← Back to Co-workers
                    </Button>

                    <Card className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarFallback className="bg-black text-white text-2xl">
                                        {getInitials(coworker.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-3xl font-light mb-2">{coworker.name}</h1>
                                    {coworker.role && (
                                        <p className="text-lg text-gray-600 mb-1">{coworker.role}</p>
                                    )}
                                    {coworker.department && (
                                        <p className="text-gray-500">{coworker.department}</p>
                                    )}
                                    {coworker.career_impact && (
                                        <Badge className={`mt-2 ${getImpactColor(coworker.career_impact)}`}>
                                            {coworker.career_impact} impact
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Edit</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Edit Co-worker</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={editData.name || ''}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="role">Role</Label>
                                                <Input
                                                    id="role"
                                                    value={editData.role || ''}
                                                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="department">Department</Label>
                                                <Input
                                                    id="department"
                                                    value={editData.department || ''}
                                                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="influence">Influence Score (1-10): {editData.influence_score || 5}</Label>
                                                <input
                                                    type="range"
                                                    id="influence"
                                                    min="1"
                                                    max="10"
                                                    value={editData.influence_score || 5}
                                                    onChange={(e) => setEditData({ ...editData, influence_score: parseInt(e.target.value) })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="relationship">Relationship Quality (1-10): {editData.relationship_quality || 5}</Label>
                                                <input
                                                    type="range"
                                                    id="relationship"
                                                    min="1"
                                                    max="10"
                                                    value={editData.relationship_quality || 5}
                                                    onChange={(e) => setEditData({ ...editData, relationship_quality: parseInt(e.target.value) })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="trust">Trust Level (1-10): {editData.trust_level || 5}</Label>
                                                <input
                                                    type="range"
                                                    id="trust"
                                                    min="1"
                                                    max="10"
                                                    value={editData.trust_level || 5}
                                                    onChange={(e) => setEditData({ ...editData, trust_level: parseInt(e.target.value) })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="impact">Career Impact</Label>
                                                <Select
                                                    value={editData.career_impact || 'neutral'}
                                                    onValueChange={(value: 'positive' | 'negative' | 'neutral') => setEditData({ ...editData, career_impact: value })}
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
                                            <Button onClick={handleUpdate} className="w-full">
                                                Save Changes
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="interactions">Interactions</TabsTrigger>
                        <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-medium mb-4">Professional Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {coworker.seniority_level && (
                                    <div>
                                        <p className="text-sm text-gray-600">Seniority Level</p>
                                        <p className="font-medium capitalize">{coworker.seniority_level}</p>
                                    </div>
                                )}
                                {coworker.relationship && (
                                    <div>
                                        <p className="text-sm text-gray-600">Relationship</p>
                                        <p className="font-medium">{coworker.relationship}</p>
                                    </div>
                                )}
                                {coworker.communication_style && (
                                    <div>
                                        <p className="text-sm text-gray-600">Communication Style</p>
                                        <p className="font-medium">{coworker.communication_style}</p>
                                    </div>
                                )}
                                {coworker.interaction_frequency && (
                                    <div>
                                        <p className="text-sm text-gray-600">Interaction Frequency</p>
                                        <p className="font-medium capitalize">{coworker.interaction_frequency}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-medium mb-4">Relationship Metrics</h2>
                            <div className="space-y-4">
                                {coworker.influence_score && (
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Influence Score</span>
                                            <span className="font-medium">{coworker.influence_score}/10</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-black h-2 rounded-full"
                                                style={{ width: `${coworker.influence_score * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {coworker.relationship_quality && (
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Relationship Quality</span>
                                            <span className="font-medium">{coworker.relationship_quality}/10</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-black h-2 rounded-full"
                                                style={{ width: `${coworker.relationship_quality * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {coworker.trust_level && (
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Trust Level</span>
                                            <span className="font-medium">{coworker.trust_level}/10</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-black h-2 rounded-full"
                                                style={{ width: `${coworker.trust_level * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="interactions">
                        <InteractionTimeline
                            interactions={interactions}
                            coworkerId={coworkerId}
                            onInteractionAdded={fetchCoworkerData}
                        />
                    </TabsContent>

                    <TabsContent value="impact">
                        <Card className="p-6">
                            <h2 className="text-xl font-medium mb-4">Career Impact Analysis</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Total Interactions</p>
                                    <p className="text-3xl font-light">{interactions.length}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Positive</p>
                                        <p className="text-2xl font-light text-green-600">
                                            {interactions.filter(i => i.sentiment === 'positive').length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Neutral</p>
                                        <p className="text-2xl font-light text-gray-600">
                                            {interactions.filter(i => i.sentiment === 'neutral').length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Negative</p>
                                        <p className="text-2xl font-light text-red-600">
                                            {interactions.filter(i => i.sentiment === 'negative').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
