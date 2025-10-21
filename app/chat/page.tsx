'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
    const router = useRouter()
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/auth/login')
                    return
                }

                const { data: profileData } = await supabase
                    .from('career_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                setProfile(profileData)
            } catch (error) {
                console.error('Error loading profile:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <div className="max-w-6xl mx-auto space-y-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">AI Career Coach</h1>
                        <p className="text-muted-foreground">Your personalized career development assistant</p>
                    </div>
                    <Button onClick={handleSignOut} variant="outline">
                        Sign Out
                    </Button>
                </div>

                {/* Welcome Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back{profile?.role_title ? `, ${profile.role_title}` : ''}!</CardTitle>
                        <CardDescription>
                            Your AI career coach is ready to help you with career advice, skill development, and professional growth.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profile && (
                            <div className="bg-primary/5 p-4 rounded-lg border">
                                <h3 className="font-semibold mb-2">Your Profile</h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Role:</span> {profile.role_title}</p>
                                    {profile.company && <p><span className="font-medium">Company:</span> {profile.company}</p>}
                                    {profile.department && <p><span className="font-medium">Department:</span> {profile.department}</p>}
                                    {profile.years_experience && <p><span className="font-medium">Experience:</span> {profile.years_experience} years</p>}
                                    {profile.industry && <p><span className="font-medium">Industry:</span> {profile.industry}</p>}
                                </div>
                            </div>
                        )}

                        <div className="bg-muted/50 p-6 rounded-lg border-2 border-dashed">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Chat Interface Coming Soon</h3>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                        The AI chat interface is currently under development. Soon you'll be able to have conversations with your AI career coach about your goals, challenges, and career development.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Career Guidance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Get personalized advice on career progression and opportunities</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Skill Development</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Identify skills to learn and create development plans</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Goal Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Set and track your professional goals with AI assistance</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
