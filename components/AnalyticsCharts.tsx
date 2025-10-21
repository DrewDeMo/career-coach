'use client';

import { Card } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Color palette for charts - minimal black/white/gray theme
const COLORS = ['#000000', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5'];

interface SkillsPieChartProps {
    data: { name: string; value: number }[];
}

export function SkillsPieChart({ data }: SkillsPieChartProps) {
    if (data.length === 0) return null;

    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Skills Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e5e7',
                            borderRadius: '8px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}

interface SkillProficiencyChartProps {
    data: { category: string; beginner: number; intermediate: number; advanced: number; expert: number }[];
}

export function SkillProficiencyChart({ data }: SkillProficiencyChartProps) {
    if (data.length === 0) return null;

    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Skill Proficiency Levels</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                    <XAxis
                        dataKey="category"
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <YAxis
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e5e7',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="beginner" stackId="a" fill="#e5e5e5" name="Beginner" />
                    <Bar dataKey="intermediate" stackId="a" fill="#a3a3a3" name="Intermediate" />
                    <Bar dataKey="advanced" stackId="a" fill="#404040" name="Advanced" />
                    <Bar dataKey="expert" stackId="a" fill="#000000" name="Expert" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}

interface GoalProgressTimelineProps {
    data: { month: string; completed: number; active: number; total: number }[];
}

export function GoalProgressTimeline({ data }: GoalProgressTimelineProps) {
    if (data.length === 0) return null;

    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Goal Progress Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <YAxis
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e5e7',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="1"
                        stroke="#000000"
                        fill="#000000"
                        name="Completed"
                    />
                    <Area
                        type="monotone"
                        dataKey="active"
                        stackId="1"
                        stroke="#737373"
                        fill="#737373"
                        name="Active"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}

interface ActivityHeatmapProps {
    data: { day: string; activities: number }[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    if (data.length === 0) return null;

    // Get max value for scaling
    const maxActivities = Math.max(...data.map(d => d.activities));

    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Activity Over Last 30 Days</h2>
            <div className="grid grid-cols-10 gap-2">
                {data.map((day, index) => {
                    const intensity = day.activities / maxActivities;
                    const bgColor = intensity === 0
                        ? '#f5f5f5'
                        : intensity < 0.25
                            ? '#e5e5e5'
                            : intensity < 0.5
                                ? '#a3a3a3'
                                : intensity < 0.75
                                    ? '#737373'
                                    : '#000000';

                    return (
                        <div
                            key={index}
                            className="aspect-square rounded-sm relative group cursor-pointer"
                            style={{ backgroundColor: bgColor }}
                            title={`${day.day}: ${day.activities} activities`}
                        >
                            <div className="absolute hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                                {day.day}: {day.activities}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                    <div className="w-3 h-3 rounded-sm bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-sm bg-gray-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-gray-700"></div>
                    <div className="w-3 h-3 rounded-sm bg-black"></div>
                </div>
                <span>More</span>
            </div>
        </Card>
    );
}

interface SkillGrowthTrendProps {
    data: { month: string; skills: number }[];
}

export function SkillGrowthTrend({ data }: SkillGrowthTrendProps) {
    if (data.length === 0) return null;

    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Skill Acquisition Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <YAxis
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e5e7',
                            borderRadius: '8px',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="skills"
                        stroke="#000000"
                        strokeWidth={2}
                        dot={{ fill: '#000000', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total Skills"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}

interface GoalCompletionRateProps {
    data: { category: string; completed: number; total: number; rate: number }[];
}

export function GoalCompletionRate({ data }: GoalCompletionRateProps) {
    if (data.length === 0) return null;

    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Goal Completion by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                    />
                    <YAxis
                        type="category"
                        dataKey="category"
                        tick={{ fill: '#737373', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e5e7' }}
                        width={100}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e5e7',
                            borderRadius: '8px',
                        }}
                        formatter={(value: number) => `${value.toFixed(0)}%`}
                    />
                    <Bar dataKey="rate" fill="#000000" name="Completion Rate" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
