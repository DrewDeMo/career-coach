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
        const milestone_id = searchParams.get('milestone_id')

        let query = supabase
            .from('project_tasks')
            .select('*')
            .eq('project_id', id)
            .eq('user_id', user.id)
            .order('order_index', { ascending: true })

        if (status) {
            query = query.eq('status', status)
        }

        if (milestone_id) {
            query = query.eq('milestone_id', milestone_id)
        }

        const { data: tasks, error } = await query

        if (error) {
            console.error('Error fetching tasks:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ tasks })
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
            milestone_id,
            status = 'todo',
            priority = 'medium',
            assigned_to,
            due_date,
            estimated_hours,
            tags = [],
            dependencies = [],
            order_index = 0
        } = body

        if (!title) {
            return NextResponse.json(
                { error: 'Task title is required' },
                { status: 400 }
            )
        }

        const { data: task, error } = await supabase
            .from('project_tasks')
            .insert({
                project_id: id,
                user_id: user.id,
                milestone_id,
                title,
                description,
                status,
                priority,
                assigned_to,
                due_date,
                estimated_hours,
                tags,
                dependencies,
                order_index
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating task:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ task }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
