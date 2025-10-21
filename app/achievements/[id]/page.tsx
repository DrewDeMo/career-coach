'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trash2, Save } from 'lucide-react'

type Achievement = Database['public']['Tables']['achievements']['Row']

export default function AchievementDetailPage() {
    const router = useRouter()
    const params = useParams()
    const achievementId = params.id as string

    const [achievement, setAchievement] = useState<Achievement | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        impact: ''
    })

    useEffect(() => {
        fetchAchievement()
    }, [achievementId])

    const fetchAchievement = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/achievements/${achievementId}`)
            const data = await response.json()

            if (response.ok) {
                setAchievement(data.achievement)
                setFormData({
                    title: data.achievement.title,
                    description: data.achievement.description || '',
                    impact: data.achievement.impact || ''
                })
            } else {
                alert('Achievement not found')
                router.push('/achievements')
            }
        } catch (error) {
            console.error('Error fetching achievement:', error)
            alert('Failed to load achievement')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Title is required')
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/achievements/${achievementId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const data = await response.json()
                setAchievement(data.achievement)
                setIsEditing(false)
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to update achievement'}`)
            }
        } catch (error) {
            console.error('Error updating achievement:', error)
            alert('Failed to update achievement')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        try {
            const response = await fetch(`/api/achievements/${achievementId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                router.push('/achievements')
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to delete achievement'}`)
            }
        } catch (error) {
            console.error('Error deleting achievement:', error)
            alert('Failed to delete achievement')
        } finally {
            setDeleting(false)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No date'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">Loading achievement...</div>
            </div>
        )
    }

    if (!achievement) {
        return null
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Button
                variant="ghost"
                onClick={() => router.push('/achievements')}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Achievements
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">
                                {isEditing ? 'Edit Achievement' : achievement.title}
                            </CardTitle>
                            <CardDescription>
                                Achieved on {formatDate(achievement.achieved_date)}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setFormData({
                                                title: achievement.title,
                                                description: achievement.description || '',
                                                impact: achievement.impact || ''
                                            })
                                        }}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isEditing ? (
                        <>
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                                    Achievement Title *
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter achievement title"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what you accomplished and how you did it"
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="impact" className="text-sm font-medium mb-2 block">
                                    Impact
                                </Label>
                                <Textarea
                                    id="impact"
                                    value={formData.impact}
                                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                    placeholder="What was the impact or result? Include metrics if available"
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {achievement.description && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {achievement.description}
                                    </p>
                                </div>
                            )}

                            {achievement.impact && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Impact</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {achievement.impact}
                                    </p>
                                </div>
                            )}

                            {!achievement.description && !achievement.impact && (
                                <p className="text-muted-foreground text-center py-8">
                                    No additional details provided. Click Edit to add more information.
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
