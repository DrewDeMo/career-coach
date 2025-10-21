'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Users,
    Search,
    Plus,
    Filter,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    UserPlus,
    Building2,
    Briefcase,
    LayoutDashboard,
    MessageSquare,
    User
} from 'lucide-react'

interface Coworker {
    id: string
    name: string
    role: string | null
    department: string | null
    seniority_level: string | null
    influence_score: number | null
    relationship_quality: number | null
    trust_level: number | null
    career_impact: 'positive' | 'negative' | 'neutral' | null
    last_interaction_date: string | null
    interaction_frequency: string | null
}

export default function CoworkersPage() {
    const router = useRouter()
    const [coworkers, setCoworkers] = useState<Coworker[]>([])
    const [filteredCoworkers, setFilteredCoworkers] = useState<Coworker[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState<string>('all')
    const [impactFilter, setImpactFilter] = useState<string>('all')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newCoworker, setNewCoworker] = useState({
        name: '',
        role: '',
        department: '',
        seniority_level: '',
        relationship: '',
        influence_score: 5,
        relationship_quality: 5,
        trust_level: 5,
        career_impact: 'neutral' as 'positive' | 'negative' | 'neutral'
    })

    useEffect(() => {
        fetchCoworkers()
    }, [])

    useEffect(() => {
        filterCoworkers()
    }, [coworkers, searchQuery, departmentFilter, impactFilter])

    const fetchCoworkers = async () => {
        try {
            const response = await fetch('/api/coworkers')
            if (response.ok) {
                const data = await response.json()
                setCoworkers(data.coworkers)
            }
        } catch (error) {
            console.error('Error fetching coworkers:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterCoworkers = () => {
        let filtered = [...coworkers]

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.role?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Department filter
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(c => c.department === departmentFilter)
        }

        // Impact filter
        if (impactFilter !== 'all') {
            filtered = filtered.filter(c => c.career_impact === impactFilter)
        }

        setFilteredCoworkers(filtered)
    }

    const handleAddCoworker = async () => {
        try {
            const response = await fetch('/api/coworkers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoworker)
            })

            if (response.ok) {
                setIsAddDialogOpen(false)
                setNewCoworker({
                    name: '',
                    role: '',
                    department: '',
                    seniority_level: '',
                    relationship: '',
                    influence_score: 5,
                    relationship_quality: 5,
                    trust_level: 5,
                    career_impact: 'neutral'
                })
                fetchCoworkers()
            }
        } catch (error) {
            console.error('Error adding coworker:', error)
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

    const departments = Array.from(new Set(coworkers.map(c => c.department).filter(Boolean)))

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading coworkers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-black">Co-workers</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage your professional relationships</p>
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
                                onClick={() => router.push('/profile')}
                                variant="outline"
                                className="text-sm gap-2"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Button>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Add Co-worker
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add New Co-worker</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                value={newCoworker.name}
                                                onChange={(e) => setNewCoworker({ ...newCoworker, name: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="role">Role</Label>
                                            <Input
                                                id="role"
                                                value={newCoworker.role}
                                                onChange={(e) => setNewCoworker({ ...newCoworker, role: e.target.value })}
                                                placeholder="Senior Developer"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                value={newCoworker.department}
                                                onChange={(e) => setNewCoworker({ ...newCoworker, department: e.target.value })}
                                                placeholder="Engineering"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="seniority">Seniority Level</Label>
                                            <Select
                                                value={newCoworker.seniority_level}
                                                onValueChange={(value) => setNewCoworker({ ...newCoworker, seniority_level: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="junior">Junior</SelectItem>
                                                    <SelectItem value="mid">Mid</SelectItem>
                                                    <SelectItem value="senior">Senior</SelectItem>
                                                    <SelectItem value="lead">Lead</SelectItem>
                                                    <SelectItem value="manager">Manager</SelectItem>
                                                    <SelectItem value="director">Director</SelectItem>
                                                    <SelectItem value="vp">VP</SelectItem>
                                                    <SelectItem value="executive">Executive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="influence">Influence Score (1-10): {newCoworker.influence_score}</Label>
                                            <input
                                                type="range"
                                                id="influence"
                                                min="1"
                                                max="10"
                                                value={newCoworker.influence_score}
                                                onChange={(e) => setNewCoworker({ ...newCoworker, influence_score: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="relationship">Relationship Quality (1-10): {newCoworker.relationship_quality}</Label>
                                            <input
                                                type="range"
                                                id="relationship"
                                                min="1"
                                                max="10"
                                                value={newCoworker.relationship_quality}
                                                onChange={(e) => setNewCoworker({ ...newCoworker, relationship_quality: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="trust">Trust Level (1-10): {newCoworker.trust_level}</Label>
                                            <input
                                                type="range"
                                                id="trust"
                                                min="1"
                                                max="10"
                                                value={newCoworker.trust_level}
                                                onChange={(e) => setNewCoworker({ ...newCoworker, trust_level: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="impact">Career Impact</Label>
                                            <Select
                                                value={newCoworker.career_impact}
                                                onValueChange={(value: 'positive' | 'negative' | 'neutral') => setNewCoworker({ ...newCoworker, career_impact: value })}
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
                                        <Button onClick={handleAddCoworker} className="w-full">
                                            Add Co-worker
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters and Search */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={impactFilter} onValueChange={setImpactFilter}>
                        <SelectTrigger className="w-full sm:w-48 gap-2">
                            <Filter className="w-4 h-4" />
                            <SelectValue placeholder="Impact" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Impact</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Coworkers Grid */}
                {filteredCoworkers.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-gray-500 mb-4">No co-workers found</p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>Add Your First Co-worker</Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCoworkers.map((coworker) => (
                            <Card
                                key={coworker.id}
                                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => router.push(`/coworkers/${coworker.id}`)}
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-black text-white">
                                            {getInitials(coworker.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{coworker.name}</h3>
                                        {coworker.role && (
                                            <p className="text-sm text-gray-600 truncate">{coworker.role}</p>
                                        )}
                                        {coworker.department && (
                                            <p className="text-xs text-gray-500 mt-1">{coworker.department}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {coworker.influence_score && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Influence</span>
                                            <span className="font-medium">{coworker.influence_score}/10</span>
                                        </div>
                                    )}
                                    {coworker.relationship_quality && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Relationship</span>
                                            <span className="font-medium">{coworker.relationship_quality}/10</span>
                                        </div>
                                    )}
                                    {coworker.career_impact && (
                                        <Badge className={getImpactColor(coworker.career_impact)}>
                                            {coworker.career_impact}
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
