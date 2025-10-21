import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const severity = searchParams.get('severity')

        let query = supabase
            .from('project_issues')
            .select('*')
            .eq('project_id', id)
            .eq('user_id', user.id)
            .order('reported_date', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        if (severity) {
            query = query.eq('severity', severity)
        }

        const { data: issues, error } = await query

        if (error) {
            console.error('Error fetching issues:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ issues })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const {
            title,
            description,
            severity = 'medium',
            status = 'open',
            category,
            impact_on_timeline,
            related_tasks = []
        } = body

        if (!title) {
            return NextResponse.json(
                { error: 'Issue title is required' },
                { status: 400 }
            )
        }

        const { data: issue, error } = await supabase
            .from('project_issues')
            .insert({
                project_id: id,
                user_id: user.id,
                title,
                description,
                severity,
                status,
                category,
                impact_on_timeline,
                related_tasks
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating issue:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Log issue creation as a blocker update
        await supabase.from('project_updates').insert({
            project_id: id,
            user_id: user.id,
            update_type: 'blocker',
            title: `New ${severity} issue reported`,
            description: title,
            impact: severity === 'critical' || severity === 'high' ? 'negative' : 'neutral'
        })

        return NextResponse.json({ issue }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
