'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/types/database'
import { AchievementCard } from '@/components/AchievementCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

type Achievement = Database['public']['Tables']['achievements']['Row']

export default function AchievementsPage() {
    const router = useRouter()
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchAchievements()
    }, [])

    const fetchAchievements = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            if (searchQuery) {
                params.append('search', searchQuery)
            }

            const response = await fetch(`/api/achievements?${params.toString()}`)
            const data = await response.json()

            if (response.ok) {
                setAchievements(data.achievements || [])
            }
        } catch (error) {
            console.error('Error fetching achievements:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchAchievements()
        }, 300)

        return () => clearTimeout(debounce)
    }, [searchQuery])

    const filteredAchievements = achievements.filter(achievement =>
        achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Achievements</h1>
                    <p className="text-muted-foreground mt-2">
                        Track your professional accomplishments and milestones
                    </p>
                </div>
                <Button onClick={() => router.push('/achievements/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Achievement
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search achievements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Achievements Grid */}
            {loading ? (
                <div className="text-center py-12">Loading achievements...</div>
            ) : filteredAchievements.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'No achievements found matching your search' : 'No achievements yet'}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => router.push('/achievements/new')}>
                            Add your first achievement
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onClick={() => router.push(`/achievements/${achievement.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
