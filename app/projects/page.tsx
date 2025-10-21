'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/types/database'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search } from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row'] & {
    project_milestones?: { count: number }[]
    project_tasks?: { count: number }[]
    project_issues?: { count: number }[]
}

export default function ProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')

    useEffect(() => {
        fetchProjects()
    }, [statusFilter, priorityFilter])

    const fetchProjects = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            if (statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            if (priorityFilter !== 'all') {
                params.append('priority', priorityFilter)
            }

            params.append('archived', 'false')

            const response = await fetch(`/api/projects?${params.toString()}`)
            const data = await response.json()

            if (response.ok) {
                setProjects(data.projects || [])
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeProjects = filteredProjects.filter(p => p.status === 'active')
    const ongoingProjects = filteredProjects.filter(p => p.status === 'ongoing')
    const completedProjects = filteredProjects.filter(p => p.status === 'completed')
    const onHoldProjects = filteredProjects.filter(p => p.status === 'on-hold')

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and track your work projects
                    </p>
                </div>
                <Button onClick={() => router.push('/projects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Projects Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">
                        All ({filteredProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Active ({activeProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="ongoing">
                        Ongoing ({ongoingProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="on-hold">
                        On Hold ({onHoldProjects.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    {loading ? (
                        <div className="text-center py-12">Loading projects...</div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">No projects found</p>
                            <Button onClick={() => router.push('/projects/new')}>
                                Create your first project
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    {activeProjects.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No active projects
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="ongoing" className="mt-6">
                    {ongoingProjects.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No ongoing projects
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ongoingProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    {completedProjects.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No completed projects
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="on-hold" className="mt-6">
                    {onHoldProjects.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No projects on hold
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {onHoldProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
