'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Database } from '@/lib/types/database'

type Project = Database['public']['Tables']['projects']['Row']

export default function ProjectDetailPage() {
    const router = useRouter()
    const params = useParams()
    const projectId = params.id as string
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
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

    useEffect(() => {
        fetchProject()
    }, [projectId])

    const fetchProject = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/projects/${projectId}`)
            const data = await response.json()

            if (response.ok) {
                const project = data.project
                setFormData({
                    name: project.name || '',
                    description: project.description || '',
                    status: project.status || 'active',
                    priority: project.priority || 'medium',
                    category: project.category || '',
                    start_date: project.start_date ? project.start_date.split('T')[0] : '',
                    due_date: project.due_date ? project.due_date.split('T')[0] : '',
                    notes: project.notes || '',
                    current_issues: project.current_issues || ''
                })
            } else {
                alert('Failed to load project')
                router.push('/projects')
            }
        } catch (error) {
            console.error('Error fetching project:', error)
            alert('Failed to load project')
            router.push('/projects')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...formData,
                start_date: formData.start_date || null,
                due_date: formData.due_date || null,
                category: formData.category || null,
                notes: formData.notes || null,
                current_issues: formData.current_issues || null
            }

            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                alert('Project updated successfully')
                router.push('/projects')
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to update project'}`)
            }
        } catch (error) {
            console.error('Error updating project:', error)
            alert('Failed to update project')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return
        }

        setDeleting(true)

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('Project deleted successfully')
                router.push('/projects')
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to delete project'}`)
            }
        } catch (error) {
            console.error('Error deleting project:', error)
            alert('Failed to delete project')
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-3xl">
                <div className="text-center py-12">Loading project...</div>
            </div>
        )
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
                    <CardTitle>Edit Project</CardTitle>
                    <CardDescription>
                        Update project details and track progress
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
                        <div className="flex gap-4 justify-between pt-4 border-t">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={saving || deleting}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleting ? 'Deleting...' : 'Delete Project'}
                            </Button>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/projects')}
                                    disabled={saving || deleting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving || deleting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
