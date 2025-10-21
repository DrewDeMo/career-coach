'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Step = 'profile' | 'skills' | 'goals' | 'complete'

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [currentStep, setCurrentStep] = useState<Step>('profile')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Career Profile State
    const [roleTitle, setRoleTitle] = useState('')
    const [company, setCompany] = useState('')
    const [department, setDepartment] = useState('')
    const [yearsExperience, setYearsExperience] = useState('')
    const [industry, setIndustry] = useState('')
    const [responsibilities, setResponsibilities] = useState('')

    // Skills State
    const [skillName, setSkillName] = useState('')
    const [skillCategory, setSkillCategory] = useState('technical')
    const [skillProficiency, setSkillProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')
    const [skills, setSkills] = useState<Array<{ name: string; category: string; proficiency: string }>>([])

    // Goals State
    const [goalTitle, setGoalTitle] = useState('')
    const [goalDescription, setGoalDescription] = useState('')
    const [goalCategory, setGoalCategory] = useState('career-growth')
    const [goals, setGoals] = useState<Array<{ title: string; description: string; category: string }>>([])

    const getStepNumber = () => {
        switch (currentStep) {
            case 'profile': return 1
            case 'skills': return 2
            case 'goals': return 3
            case 'complete': return 4
            default: return 1
        }
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const responsibilitiesArray = responsibilities
                .split('\n')
                .map(r => r.trim())
                .filter(r => r.length > 0)

            // Delete any existing profile first (ignore errors if none exists)
            await supabase
                .from('career_profiles')
                .delete()
                .eq('user_id', user.id)

            // Insert fresh profile
            const { error: profileError } = await supabase
                .from('career_profiles')
                .insert({
                    user_id: user.id,
                    role_title: roleTitle,
                    company: company || null,
                    department: department || null,
                    years_experience: yearsExperience ? parseInt(yearsExperience) : null,
                    industry: industry || null,
                    responsibilities: responsibilitiesArray
                })

            if (profileError) throw profileError

            setCurrentStep('skills')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    const addSkill = () => {
        if (skillName.trim()) {
            setSkills([...skills, { name: skillName, category: skillCategory, proficiency: skillProficiency }])
            setSkillName('')
        }
    }

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index))
    }

    const handleSkillsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            if (skills.length > 0) {
                const skillsData = skills.map(skill => ({
                    user_id: user.id,
                    name: skill.name,
                    category: skill.category,
                    proficiency_level: skill.proficiency
                }))

                const { error: skillsError } = await supabase
                    .from('skills')
                    .insert(skillsData)

                if (skillsError) throw skillsError
            }

            setCurrentStep('goals')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save skills')
        } finally {
            setLoading(false)
        }
    }

    const addGoal = () => {
        if (goalTitle.trim()) {
            setGoals([...goals, { title: goalTitle, description: goalDescription, category: goalCategory }])
            setGoalTitle('')
            setGoalDescription('')
        }
    }

    const removeGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index))
    }

    const handleGoalsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            if (goals.length > 0) {
                const goalsData = goals.map(goal => ({
                    user_id: user.id,
                    title: goal.title,
                    description: goal.description,
                    category: goal.category
                }))

                const { error: goalsError } = await supabase
                    .from('goals')
                    .insert(goalsData)

                if (goalsError) throw goalsError
            }

            setCurrentStep('complete')
            setTimeout(() => router.push('/chat'), 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save goals')
        } finally {
            setLoading(false)
        }
    }

    const skipStep = () => {
        if (currentStep === 'skills') {
            setCurrentStep('goals')
        } else if (currentStep === 'goals') {
            setCurrentStep('complete')
            setTimeout(() => router.push('/chat'), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-start justify-between gap-4">
                        {['Profile', 'Skills', 'Goals', 'Complete'].map((step, index) => (
                            <div key={step} className="flex flex-col items-center">
                                <div className="flex items-center">
                                    {index > 0 && (
                                        <div className={`w-16 h-0.5 ${getStepNumber() > index ? 'bg-black' : 'bg-gray-200'
                                            }`} />
                                    )}
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${getStepNumber() > index + 1
                                        ? 'bg-black text-white'
                                        : getStepNumber() === index + 1
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {getStepNumber() > index + 1 ? '✓' : index + 1}
                                    </div>
                                    {index < 3 && (
                                        <div className={`w-16 h-0.5 ${getStepNumber() > index + 1 ? 'bg-black' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                                <span className={`mt-2 text-xs font-medium whitespace-nowrap ${getStepNumber() === index + 1 ? 'text-black' : 'text-gray-500'
                                    }`}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Career Profile */}
                {currentStep === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight">Welcome! Let's set up your profile</h1>
                            <p className="text-gray-600">Tell us about your current role to get personalized coaching.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="roleTitle" className="text-sm font-medium">
                                    Current Role <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="roleTitle"
                                    value={roleTitle}
                                    onChange={(e) => setRoleTitle(e.target.value)}
                                    required
                                    placeholder="e.g., Senior Software Engineer"
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                                    <Input
                                        id="company"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g., Tech Corp"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                                    <Input
                                        id="department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="e.g., Engineering"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="yearsExperience" className="text-sm font-medium">Years of Experience</Label>
                                    <Input
                                        id="yearsExperience"
                                        type="number"
                                        value={yearsExperience}
                                        onChange={(e) => setYearsExperience(e.target.value)}
                                        min="0"
                                        placeholder="e.g., 5"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                                    <Input
                                        id="industry"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        placeholder="e.g., Technology"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="responsibilities" className="text-sm font-medium">Key Responsibilities</Label>
                                <Textarea
                                    id="responsibilities"
                                    value={responsibilities}
                                    onChange={(e) => setResponsibilities(e.target.value)}
                                    rows={4}
                                    placeholder="Enter each responsibility on a new line"
                                    className="resize-none"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !roleTitle}
                            className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium"
                        >
                            {loading ? 'Saving...' : 'Continue →'}
                        </Button>
                    </form>
                )}

                {/* Step 2: Skills */}
                {currentStep === 'skills' && (
                    <form onSubmit={handleSkillsSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight">Add Your Skills</h1>
                            <p className="text-gray-600">Help us understand your expertise (optional).</p>
                        </div>

                        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="skillName" className="text-sm font-medium">Skill Name</Label>
                                <Input
                                    id="skillName"
                                    value={skillName}
                                    onChange={(e) => setSkillName(e.target.value)}
                                    placeholder="e.g., React, Leadership, Python"
                                    className="h-11 bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="skillCategory" className="text-sm font-medium">Category</Label>
                                    <Select value={skillCategory} onValueChange={setSkillCategory}>
                                        <SelectTrigger id="skillCategory" className="h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technical">Technical</SelectItem>
                                            <SelectItem value="soft-skills">Soft Skills</SelectItem>
                                            <SelectItem value="leadership">Leadership</SelectItem>
                                            <SelectItem value="tools">Tools</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="skillProficiency" className="text-sm font-medium">Proficiency</Label>
                                    <Select value={skillProficiency} onValueChange={(value: any) => setSkillProficiency(value)}>
                                        <SelectTrigger id="skillProficiency" className="h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                            <SelectItem value="expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={addSkill}
                                disabled={!skillName.trim()}
                                variant="outline"
                                className="w-full h-11 font-medium"
                            >
                                + Add Skill
                            </Button>
                        </div>

                        {skills.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Added Skills ({skills.length})</Label>
                                <div className="space-y-2">
                                    {skills.map((skill, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                            <div>
                                                <div className="font-medium">{skill.name}</div>
                                                <div className="text-sm text-gray-600 capitalize">{skill.category} · {skill.proficiency}</div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => removeSkill(index)}
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={skipStep}
                                variant="outline"
                                className="flex-1 h-11 font-medium"
                            >
                                Skip
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-11 bg-black hover:bg-gray-800 text-white font-medium"
                            >
                                {loading ? 'Saving...' : 'Continue →'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 3: Goals */}
                {currentStep === 'goals' && (
                    <form onSubmit={handleGoalsSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight">Set Your Goals</h1>
                            <p className="text-gray-600">What do you want to achieve? (optional)</p>
                        </div>

                        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="goalTitle" className="text-sm font-medium">Goal Title</Label>
                                <Input
                                    id="goalTitle"
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    placeholder="e.g., Get promoted to Tech Lead"
                                    className="h-11 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goalDescription" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="goalDescription"
                                    value={goalDescription}
                                    onChange={(e) => setGoalDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Describe your goal in more detail..."
                                    className="resize-none bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goalCategory" className="text-sm font-medium">Category</Label>
                                <Select value={goalCategory} onValueChange={setGoalCategory}>
                                    <SelectTrigger id="goalCategory" className="h-11 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="career-growth">Career Growth</SelectItem>
                                        <SelectItem value="skill-development">Skill Development</SelectItem>
                                        <SelectItem value="leadership">Leadership</SelectItem>
                                        <SelectItem value="work-life-balance">Work-Life Balance</SelectItem>
                                        <SelectItem value="networking">Networking</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                onClick={addGoal}
                                disabled={!goalTitle.trim()}
                                variant="outline"
                                className="w-full h-11 font-medium"
                            >
                                + Add Goal
                            </Button>
                        </div>

                        {goals.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Added Goals ({goals.length})</Label>
                                <div className="space-y-3">
                                    {goals.map((goal, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <div className="font-medium">{goal.title}</div>
                                                    {goal.description && (
                                                        <div className="text-sm text-gray-600">{goal.description}</div>
                                                    )}
                                                    <div className="text-xs text-gray-500 capitalize">{goal.category.replace('-', ' ')}</div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeGoal(index)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={skipStep}
                                variant="outline"
                                className="flex-1 h-11 font-medium"
                            >
                                Skip
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-11 bg-black hover:bg-gray-800 text-white font-medium"
                            >
                                {loading ? 'Saving...' : 'Complete Setup'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 4: Complete */}
                {currentStep === 'complete' && (
                    <div className="text-center py-16 space-y-6">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight">All Set!</h1>
                            <p className="text-gray-600">Redirecting to your AI career coach...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
