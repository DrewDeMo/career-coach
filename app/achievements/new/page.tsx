'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewAchievementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        impact: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const { achievement } = await response.json()
                router.push(`/achievements/${achievement.id}`)
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to create achievement'}`)
            }
        } catch (error) {
            console.error('Error creating achievement:', error)
            alert('Failed to create achievement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
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
                    <CardTitle>Add New Achievement</CardTitle>
                    <CardDescription>
                        Record a professional accomplishment or milestone
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                                Achievement Title *
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Led successful product launch"
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

                        <div className="flex gap-4 justify-end pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/achievements')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Achievement'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
