'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
    SkillsPieChart,
    SkillProficiencyChart,
    GoalProgressTimeline,
    ActivityHeatmap,
    SkillGrowthTrend,
    GoalCompletionRate,
} from '@/components/AnalyticsCharts';
import {
    MessageSquare,
    Users,
    User,
    BookOpen,
    Target,
    FolderKanban,
    Award,
    TrendingUp,
    Loader2,
    BarChart3
} from 'lucide-react';

interface DashboardStats {
    totalSkills: number;
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalProjects: number;
    totalAchievements: number;
    skillsByCategory: { [key: string]: number };
    goalsByCategory: { [key: string]: number };
    recentSkills: Array<{ name: string; proficiency_level: string; created_at: string }>;
    recentGoals: Array<{ title: string; status: string; created_at: string }>;
}

interface AnalyticsData {
    skillsPieData: Array<{ name: string; value: number }>;
    skillProficiencyData: Array<{ category: string; beginner: number; intermediate: number; advanced: number; expert: number }>;
    goalTimelineData: Array<{ month: string; completed: number; active: number; total: number }>;
    activityHeatmapData: Array<{ day: string; activities: number }>;
    skillGrowthData: Array<{ month: string; skills: number }>;
    goalCompletionData: Array<{ category: string; completed: number; total: number; rate: number }>;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            const supabase = createClient();

            // Get user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Get user profile for name
            const { data: profile } = await supabase
                .from('career_profiles')
                .select('role_title')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                setUserName(profile.role_title || 'there');
            }

            // Get all stats in parallel
            const [
                skillsResult,
                goalsResult,
                projectsResult,
                achievementsResult,
            ] = await Promise.all([
                supabase.from('skills').select('*').eq('user_id', user.id),
                supabase.from('goals').select('*').eq('user_id', user.id),
                supabase.from('projects').select('*').eq('user_id', user.id),
                supabase.from('achievements').select('*').eq('user_id', user.id),
            ]);

            const skills = skillsResult.data || [];
            const goals = goalsResult.data || [];
            const projects = projectsResult.data || [];
            const achievements = achievementsResult.data || [];

            // Calculate stats
            const activeGoals = goals.filter(g => g.status === 'active').length;
            const completedGoals = goals.filter(g => g.status === 'completed').length;

            // Group by category
            const skillsByCategory: { [key: string]: number } = {};
            skills.forEach(skill => {
                const category = skill.category || 'Other';
                skillsByCategory[category] = (skillsByCategory[category] || 0) + 1;
            });

            const goalsByCategory: { [key: string]: number } = {};
            goals.forEach(goal => {
                const category = goal.category || 'Other';
                goalsByCategory[category] = (goalsByCategory[category] || 0) + 1;
            });

            // Get recent items (last 5)
            const recentSkills = skills
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map(s => ({
                    name: s.skill_name || s.name || 'Unnamed Skill',
                    proficiency_level: s.proficiency_level || 'beginner',
                    created_at: s.created_at,
                }));

            const recentGoals = goals
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map(g => ({
                    title: g.title,
                    status: g.status,
                    created_at: g.created_at,
                }));

            setStats({
                totalSkills: skills.length,
                totalGoals: goals.length,
                activeGoals,
                completedGoals,
                totalProjects: projects.length,
                totalAchievements: achievements.length,
                skillsByCategory,
                goalsByCategory,
                recentSkills,
                recentGoals,
            });

            // Process analytics data
            setAnalytics(processAnalyticsData(skills, goals, projects, achievements));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    function processAnalyticsData(skills: any[], goals: any[], projects: any[], achievements: any[]): AnalyticsData {
        // Skills Pie Chart Data
        const skillsByCategory: { [key: string]: number } = {};
        skills.forEach(skill => {
            const category = skill.category || 'Other';
            skillsByCategory[category] = (skillsByCategory[category] || 0) + 1;
        });
        const skillsPieData = Object.entries(skillsByCategory).map(([name, value]) => ({ name, value }));

        // Skill Proficiency Data
        const proficiencyByCategory: { [key: string]: { beginner: number; intermediate: number; advanced: number; expert: number } } = {};
        skills.forEach(skill => {
            const category = skill.category || 'Other';
            if (!proficiencyByCategory[category]) {
                proficiencyByCategory[category] = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
            }
            const level = skill.proficiency_level || 'beginner';
            proficiencyByCategory[category][level as keyof typeof proficiencyByCategory[string]]++;
        });
        const skillProficiencyData = Object.entries(proficiencyByCategory).map(([category, levels]) => ({
            category,
            ...levels,
        }));

        // Goal Timeline Data (last 6 months)
        const now = new Date();
        const goalTimelineData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const monthGoals = goals.filter(g => {
                const createdDate = new Date(g.created_at);
                return createdDate.getMonth() === date.getMonth() && createdDate.getFullYear() === date.getFullYear();
            });
            const completed = monthGoals.filter(g => g.status === 'completed').length;
            const active = monthGoals.filter(g => g.status === 'active').length;
            goalTimelineData.push({
                month: monthName,
                completed,
                active,
                total: completed + active,
            });
        }

        // Activity Heatmap Data (last 30 days)
        const activityHeatmapData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Count activities for this day (skills, goals, projects, achievements added)
            const activities = [
                ...skills.filter(s => new Date(s.created_at).toDateString() === date.toDateString()),
                ...goals.filter(g => new Date(g.created_at).toDateString() === date.toDateString()),
                ...projects.filter(p => new Date(p.created_at).toDateString() === date.toDateString()),
                ...achievements.filter(a => new Date(a.created_at).toDateString() === date.toDateString()),
            ].length;

            activityHeatmapData.push({ day: dayStr, activities });
        }

        // Skill Growth Trend (last 6 months)
        const skillGrowthData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const skillsUpToMonth = skills.filter(s => new Date(s.created_at) <= date).length;
            skillGrowthData.push({ month: monthName, skills: skillsUpToMonth });
        }

        // Goal Completion Rate by Category
        const goalCompletionByCategory: { [key: string]: { completed: number; total: number } } = {};
        goals.forEach(goal => {
            const category = goal.category || 'Other';
            if (!goalCompletionByCategory[category]) {
                goalCompletionByCategory[category] = { completed: 0, total: 0 };
            }
            goalCompletionByCategory[category].total++;
            if (goal.status === 'completed') {
                goalCompletionByCategory[category].completed++;
            }
        });
        const goalCompletionData = Object.entries(goalCompletionByCategory).map(([category, data]) => ({
            category,
            completed: data.completed,
            total: data.total,
            rate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        }));

        return {
            skillsPieData,
            skillProficiencyData,
            goalTimelineData,
            activityHeatmapData,
            skillGrowthData,
            goalCompletionData,
        };
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <div className="text-sm text-gray-500">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-sm text-gray-400">Failed to load dashboard</div>
                </div>
            </div>
        );
    }

    const goalCompletionRate = stats.totalGoals > 0
        ? Math.round((stats.completedGoals / stats.totalGoals) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-black">
                                    Welcome back{userName ? `, ${userName}` : ''}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Here's an overview of your career progress
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href="/chat"
                                className="px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Chat
                            </Link>
                            <Link
                                href="/projects"
                                className="px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FolderKanban className="w-4 h-4" />
                                Projects
                            </Link>
                            <Link
                                href="/coworkers"
                                className="px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Co-workers
                            </Link>
                            <Link
                                href="/profile"
                                className="px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Skills Card */}
                    <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Total Skills</div>
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-black mb-1">
                            {stats.totalSkills}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Across {Object.keys(stats.skillsByCategory).length} categories
                        </div>
                    </Card>

                    {/* Goals Card */}
                    <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Active Goals</div>
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-black mb-1">
                            {stats.activeGoals}
                        </div>
                        <div className="text-xs text-gray-500">
                            {stats.completedGoals} completed
                        </div>
                    </Card>

                    {/* Projects Card */}
                    <Link href="/projects">
                        <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-medium text-gray-600">Projects</div>
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <FolderKanban className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-black mb-1">
                                {stats.totalProjects}
                            </div>
                            <div className="text-xs text-gray-500">
                                Total tracked
                            </div>
                        </Card>
                    </Link>

                    {/* Achievements Card */}
                    <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Achievements</div>
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-black mb-1">
                            {stats.totalAchievements}
                        </div>
                        <div className="text-xs text-gray-500">
                            Career milestones
                        </div>
                    </Card>
                </div>

                {/* Goal Progress */}
                {stats.totalGoals > 0 && (
                    <Card className="p-6 border border-gray-200 mb-8">
                        <h2 className="text-lg font-semibold text-black mb-4">
                            Goal Completion
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Overall Progress</span>
                                <span className="font-medium text-black">{goalCompletionRate}%</span>
                            </div>
                            <Progress value={goalCompletionRate} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{stats.completedGoals} completed</span>
                                <span>{stats.activeGoals} active</span>
                                <span>{stats.totalGoals} total</span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Skills Breakdown */}
                    {Object.keys(stats.skillsByCategory).length > 0 && (
                        <Card className="p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Skills by Category
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(stats.skillsByCategory)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category, count]) => (
                                        <div key={category}>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-600">{category}</span>
                                                <span className="font-medium text-black">{count}</span>
                                            </div>
                                            <Progress
                                                value={(count / stats.totalSkills) * 100}
                                                className="h-1.5"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    )}

                    {/* Goals Breakdown */}
                    {Object.keys(stats.goalsByCategory).length > 0 && (
                        <Card className="p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Goals by Category
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(stats.goalsByCategory)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category, count]) => (
                                        <div key={category}>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-600">{category}</span>
                                                <span className="font-medium text-black">{count}</span>
                                            </div>
                                            <Progress
                                                value={(count / stats.totalGoals) * 100}
                                                className="h-1.5"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Recent Skills */}
                    {stats.recentSkills.length > 0 && (
                        <Card className="p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Recent Skills
                            </h2>
                            <div className="space-y-3">
                                {stats.recentSkills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-black">
                                                {skill.name}
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">
                                                {skill.proficiency_level}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(skill.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Recent Goals */}
                    {stats.recentGoals.length > 0 && (
                        <Card className="p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Recent Goals
                            </h2>
                            <div className="space-y-3">
                                {stats.recentGoals.map((goal, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-black">
                                                {goal.title}
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">
                                                {goal.status}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(goal.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Advanced Analytics Section */}
                {stats.totalSkills > 0 && analytics && (
                    <>
                        <div className="mt-12 mb-6">
                            <h2 className="text-xl font-semibold text-black">Advanced Analytics</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Detailed insights into your career development
                            </p>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <SkillsPieChart data={analytics.skillsPieData} />
                            <SkillGrowthTrend data={analytics.skillGrowthData} />
                        </div>

                        <div className="grid grid-cols-1 gap-8 mb-8">
                            <SkillProficiencyChart data={analytics.skillProficiencyData} />
                        </div>

                        {stats.totalGoals > 0 && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    <GoalProgressTimeline data={analytics.goalTimelineData} />
                                    <GoalCompletionRate data={analytics.goalCompletionData} />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-1 gap-8 mb-8">
                            <ActivityHeatmap data={analytics.activityHeatmapData} />
                        </div>
                    </>
                )}

                {/* Empty State */}
                {stats.totalSkills === 0 && stats.totalGoals === 0 && stats.totalProjects === 0 && (
                    <Card className="p-12 border border-gray-200 text-center mt-8">
                        <div className="text-gray-400 mb-4">
                            <svg
                                className="w-16 h-16 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                No data yet
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Start chatting with your AI career coach to build your profile
                            </p>
                            <Link
                                href="/chat"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Start Chatting
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
