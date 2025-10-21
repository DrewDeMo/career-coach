'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { User, LayoutDashboard, MessageSquare, Users, Loader2, Edit, Save, X, Trash2 } from 'lucide-react'

interface CareerProfile {
    role_title: string
    company: string
    department: string
    years_experience: number
    industry: string
    responsibilities: string[]
}

interface Skill {
    id: string
    name: string
    skill_name?: string
    category: string
    proficiency_level: number | string
    created_at: string
}

interface Goal {
    id: string
    title: string
    description: string
    category: string
    status: string
    target_date?: string
    created_at: string
}

interface Project {
    id: string
    project_name: string
    description: string
    role: string
    technologies?: string[]
    start_date?: string
    end_date?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [profile, setProfile] = useState<CareerProfile | null>(null)
    const [skills, setSkills] = useState<Skill[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [editedProfile, setEditedProfile] = useState<CareerProfile | null>(null)

    useEffect(() => {
        loadProfileData()
    }, [])

    async function loadProfileData() {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            // Load career profile
            const { data: profileData } = await supabase
                .from('career_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            // Load skills
            const { data: skillsData } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Load goals
            const { data: goalsData } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Load projects
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('start_date', { ascending: false })

            setProfile(profileData)
            setEditedProfile(profileData)
            setSkills(skillsData || [])
            setGoals(goalsData || [])
            setProjects(projectsData || [])
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveProfile() {
        if (!editedProfile) return

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { error } = await supabase
                .from('career_profiles')
                .update(editedProfile)
                .eq('user_id', user.id)

            if (error) throw error

            setProfile(editedProfile)
            setEditMode(false)
        } catch (error) {
            console.error('Error saving profile:', error)
        }
    }

    async function handleDeleteSkill(skillId: string) {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('skills')
                .delete()
                .eq('id', skillId)

            if (error) throw error

            setSkills(skills.filter(s => s.id !== skillId))
        } catch (error) {
            console.error('Error deleting skill:', error)
        }
    }

    async function handleDeleteGoal(goalId: string) {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId)

            if (error) throw error

            setGoals(goals.filter(g => g.id !== goalId))
        } catch (error) {
            console.error('Error deleting goal:', error)
        }
    }

    async function handleDeleteProject(projectId: string) {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (error) throw error

            setProjects(projects.filter(p => p.id !== projectId))
        } catch (error) {
            console.error('Error deleting project:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <div className="text-sm text-gray-500">Loading profile...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-black">Career Profile</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage your career information</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="outline"
                                className="text-sm gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Button>
                            <Button
                                onClick={() => router.push('/chat')}
                                variant="outline"
                                className="text-sm gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Chat
                            </Button>
                            <Button
                                onClick={() => router.push('/coworkers')}
                                variant="outline"
                                className="text-sm gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Co-workers
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Career Profile Section */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Career Information</h2>
                        {!editMode ? (
                            <Button onClick={() => setEditMode(true)} className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={handleSaveProfile} className="gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditedProfile(profile)
                                        setEditMode(false)
                                    }}
                                    className="gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {profile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Current Role</Label>
                                {editMode ? (
                                    <Input
                                        value={editedProfile?.role_title || ''}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile!,
                                            role_title: e.target.value
                                        })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.role_title}</div>
                                )}
                            </div>

                            <div>
                                <Label>Company</Label>
                                {editMode ? (
                                    <Input
                                        value={editedProfile?.company || ''}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile!,
                                            company: e.target.value
                                        })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.company}</div>
                                )}
                            </div>

                            <div>
                                <Label>Department</Label>
                                {editMode ? (
                                    <Input
                                        value={editedProfile?.department || ''}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile!,
                                            department: e.target.value
                                        })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.department}</div>
                                )}
                            </div>

                            <div>
                                <Label>Years of Experience</Label>
                                {editMode ? (
                                    <Input
                                        type="number"
                                        value={editedProfile?.years_experience || 0}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile!,
                                            years_experience: parseInt(e.target.value)
                                        })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.years_experience} years</div>
                                )}
                            </div>

                            <div>
                                <Label>Industry</Label>
                                {editMode ? (
                                    <Input
                                        value={editedProfile?.industry || ''}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile!,
                                            industry: e.target.value
                                        })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.industry}</div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label>Key Responsibilities</Label>
                                {editMode ? (
                                    <Textarea
                                        value={editedProfile?.responsibilities?.join('\n') || ''}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile!,
                                            responsibilities: e.target.value.split('\n').filter(r => r.trim())
                                        })}
                                        className="mt-1"
                                        rows={4}
                                        placeholder="Enter each responsibility on a new line"
                                    />
                                ) : (
                                    <ul className="mt-1 list-disc list-inside text-gray-900">
                                        {profile.responsibilities?.map((resp, idx) => (
                                            <li key={idx}>{resp}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Skills Section */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Skills</h2>
                    {skills.length === 0 ? (
                        <p className="text-gray-600">No skills added yet</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skills.map((skill) => {
                                const skillName = skill.name || skill.skill_name || 'Unknown Skill'
                                const proficiencyDisplay = typeof skill.proficiency_level === 'number'
                                    ? `${skill.proficiency_level}/5`
                                    : skill.proficiency_level
                                const dateAdded = new Date(skill.created_at).toLocaleDateString()

                                return (
                                    <div key={skill.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{skillName}</div>
                                            <div className="text-sm text-gray-600">
                                                {skill.category} • Level {proficiencyDisplay}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Added: {dateAdded}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            className="gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>

                {/* Goals Section */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Goals</h2>
                    {goals.length === 0 ? (
                        <p className="text-gray-600">No goals set yet</p>
                    ) : (
                        <div className="space-y-4">
                            {goals.map((goal) => {
                                const dateAdded = new Date(goal.created_at).toLocaleDateString()

                                return (
                                    <div key={goal.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{goal.title}</div>
                                            {goal.description && (
                                                <div className="text-sm text-gray-600 mt-1">{goal.description}</div>
                                            )}
                                            <div className="text-sm text-gray-500 mt-2">
                                                {goal.category} • {goal.status}
                                                {goal.target_date && ` • Target: ${new Date(goal.target_date).toLocaleDateString()}`}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Added: {dateAdded}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>

                {/* Projects Section */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Projects</h2>
                    {projects.length === 0 ? (
                        <p className="text-gray-600">No projects added yet</p>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div key={project.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{project.project_name}</div>
                                        {project.description && (
                                            <div className="text-sm text-gray-600 mt-1">{project.description}</div>
                                        )}
                                        <div className="text-sm text-gray-500 mt-2">
                                            Role: {project.role}
                                            {project.technologies && project.technologies.length > 0 && (
                                                <span> • Technologies: {project.technologies.join(', ')}</span>
                                            )}
                                        </div>
                                        {(project.start_date || project.end_date) && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                {project.start_date && new Date(project.start_date).toLocaleDateString()}
                                                {project.start_date && project.end_date && ' - '}
                                                {project.end_date && new Date(project.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
