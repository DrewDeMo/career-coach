import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const archived = searchParams.get('archived')
        const category = searchParams.get('category')
        const priority = searchParams.get('priority')

        let query = supabase
            .from('projects')
            .select(`
        *,
        project_milestones(count),
        project_tasks(count),
        project_issues(count)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        if (archived !== null) {
            query = query.eq('archived', archived === 'true')
        }

        if (category) {
            query = query.eq('category', category)
        }

        if (priority) {
            query = query.eq('priority', priority)
        }

        const { data: projects, error } = await query

        if (error) {
            console.error('Error fetching projects:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ projects })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            name,
            description,
            status = 'active',
            priority = 'medium',
            category,
            start_date,
            due_date,
            estimated_hours,
            budget,
            technologies = [],
            team_members = [],
            stakeholders = [],
            goals = [],
            risks = [],
            dependencies = [],
            deliverables = [],
            tags = [],
            notes
        } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            )
        }

        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                name,
                description,
                status,
                priority,
                category,
                start_date,
                due_date,
                estimated_hours,
                budget,
                technologies,
                team_members,
                stakeholders,
                goals,
                risks,
                dependencies,
                deliverables,
                tags,
                notes,
                completion_percentage: 0,
                archived: false
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating project:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Log project creation
        await supabase.from('project_updates').insert({
            project_id: project.id,
            user_id: user.id,
            update_type: 'status_change',
            title: 'Project created',
            description: `Project "${name}" was created`,
            new_value: status,
            impact: 'positive'
        })

        return NextResponse.json({ project }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
