'use client'

import { Database } from '@/lib/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectCardProps {
    project: Project & {
        project_milestones?: { count: number }[]
        project_tasks?: { count: number }[]
        project_issues?: { count: number }[]
    }
    onClick?: () => void
}

const statusColors = {
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    'on-hold': 'bg-yellow-500',
    cancelled: 'bg-red-500'
}

const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const milestoneCount = project.project_milestones?.[0]?.count || 0
    const taskCount = project.project_tasks?.[0]?.count || 0
    const issueCount = project.project_issues?.[0]?.count || 0

    const dueDate = project.due_date ? new Date(project.due_date) : null
    const isOverdue = dueDate && dueDate < new Date() && project.status !== 'completed'
    const dueSoon = dueDate && dueDate > new Date() && dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {project.description || 'No description'}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                        <Badge className={statusColors[project.status]}>
                            {project.status}
                        </Badge>
                        <Badge className={priorityColors[project.priority]}>
                            {project.priority}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.completion_percentage}%</span>
                        </div>
                        <Progress value={project.completion_percentage} />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{milestoneCount}</div>
                                <div className="text-xs text-muted-foreground">Milestones</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{taskCount}</div>
                                <div className="text-xs text-muted-foreground">Tasks</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{issueCount}</div>
                                <div className="text-xs text-muted-foreground">Issues</div>
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    {dueDate && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={`${isOverdue ? 'text-red-500 font-medium' : dueSoon ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
                                Due: {dueDate.toLocaleDateString()}
                                {isOverdue && ' (Overdue)'}
                                {dueSoon && ' (Due Soon)'}
                            </span>
                        </div>
                    )}

                    {/* Tags */}
                    {Array.isArray(project.tags) && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {(project.tags as string[]).slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {(project.tags as string[]).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{(project.tags as string[]).length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Category */}
                    {project.category && (
                        <div className="text-xs text-muted-foreground">
                            Category: {project.category}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
