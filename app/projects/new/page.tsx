'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
        priority: 'medium',
        category: '',
        start_date: '',
        due_date: '',
        notes: '',
        current_issues: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                start_date: formData.start_date || null,
                due_date: formData.due_date || null,
                category: formData.category || null,
                notes: formData.notes || null
            }

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const { project } = await response.json()
                router.push(`/projects/${project.id}`)
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to create project'}`)
            }
        } catch (error) {
            console.error('Error creating project:', error)
            alert('Failed to create project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <Button
                variant="ghost"
                onClick={() => router.push('/projects')}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>
                        Add a new project to track your work
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-5">
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                                    Project Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter project name"
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
                                    placeholder="Describe the project goals and objectives"
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="status" className="text-sm font-medium mb-2 block">
                                        Status
                                    </Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="on-hold">On Hold</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="priority" className="text-sm font-medium mb-2 block">
                                        Priority
                                    </Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                                    Category
                                </Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., Development, Marketing, Research"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Dates - Hidden for ongoing projects */}
                        {formData.status !== 'ongoing' && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-semibold">Timeline</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label htmlFor="start_date" className="text-sm font-medium mb-2 block">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="due_date" className="text-sm font-medium mb-2 block">
                                            Due Date
                                        </Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold">Additional Information</h3>

                            <div>
                                <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes, context, or important details about this project"
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="current_issues" className="text-sm font-medium mb-2 block">
                                    Current Issues
                                </Label>
                                <Textarea
                                    id="current_issues"
                                    value={formData.current_issues}
                                    onChange={(e) => setFormData({ ...formData, current_issues: e.target.value })}
                                    placeholder="List any current blockers, challenges, or concerns"
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 justify-end pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/projects')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
