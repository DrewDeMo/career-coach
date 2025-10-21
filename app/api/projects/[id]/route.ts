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

        const { data: project, error } = await supabase
            .from('projects')
            .select(`
        *,
        project_milestones(*),
        project_tasks(*),
        project_updates(*),
        project_issues(*)
      `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching project:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json({ project })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
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

        // Get current project for comparison
        const { data: currentProject } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!currentProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const { data: project, error } = await supabase
            .from('projects')
            .update(body)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating project:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Log significant changes
        if (body.status && body.status !== currentProject.status) {
            await supabase.from('project_updates').insert({
                project_id: id,
                user_id: user.id,
                update_type: 'status_change',
                title: 'Status changed',
                description: `Project status changed from ${currentProject.status} to ${body.status}`,
                previous_value: currentProject.status,
                new_value: body.status,
                impact: body.status === 'completed' ? 'positive' : 'neutral'
            })
        }

        if (body.completion_percentage !== undefined && body.completion_percentage !== currentProject.completion_percentage) {
            await supabase.from('project_updates').insert({
                project_id: id,
                user_id: user.id,
                update_type: 'progress',
                title: 'Progress updated',
                description: `Project completion updated from ${currentProject.completion_percentage}% to ${body.completion_percentage}%`,
                previous_value: currentProject.completion_percentage.toString(),
                new_value: body.completion_percentage.toString(),
                impact: body.completion_percentage > currentProject.completion_percentage ? 'positive' : 'neutral'
            })
        }

        return NextResponse.json({ project })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
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

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting project:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
