import { Database } from '@/lib/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Calendar } from 'lucide-react'

type Achievement = Database['public']['Tables']['achievements']['Row']

interface AchievementCardProps {
    achievement: Achievement
    onClick?: () => void
}

export function AchievementCard({ achievement, onClick }: AchievementCardProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No date'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            {achievement.title}
                        </CardTitle>
                        {achievement.description && (
                            <CardDescription className="line-clamp-2">
                                {achievement.description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {achievement.impact && (
                        <div>
                            <p className="text-sm font-medium mb-1">Impact</p>
                            <p className="text-sm text-muted-foreground">{achievement.impact}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(achievement.achieved_date)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
