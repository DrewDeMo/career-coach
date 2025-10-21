import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch a single coworker with interactions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const resolvedParams = await params
        const coworkerId = resolvedParams.id

        // Fetch coworker
        const { data: coworker, error: coworkerError } = await supabase
            .from('coworkers')
            .select('*')
            .eq('id', coworkerId)
            .eq('user_id', user.id)
            .single()

        if (coworkerError || !coworker) {
            return NextResponse.json(
                { error: 'Coworker not found' },
                { status: 404 }
            )
        }

        // Fetch interactions for this coworker
        const { data: interactions, error: interactionsError } = await supabase
            .from('coworker_interactions')
            .select('*')
            .eq('coworker_id', coworkerId)
            .eq('user_id', user.id)
            .order('interaction_date', { ascending: false })

        if (interactionsError) {
            console.error('Error fetching interactions:', interactionsError)
        }

        return NextResponse.json({
            coworker,
            interactions: interactions || []
        })

    } catch (error) {
        console.error('Get coworker API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// PATCH - Update a coworker
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const resolvedParams = await params
        const coworkerId = resolvedParams.id
        const body = await request.json()

        // Remove fields that shouldn't be updated directly
        const { id, user_id, created_at, ...updateData } = body

        // Update coworker
        const { data: coworker, error } = await supabase
            .from('coworkers')
            .update(updateData)
            .eq('id', coworkerId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating coworker:', error)
            return NextResponse.json(
                { error: 'Failed to update coworker' },
                { status: 500 }
            )
        }

        if (!coworker) {
            return NextResponse.json(
                { error: 'Coworker not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ coworker })

    } catch (error) {
        console.error('Update coworker API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// DELETE - Delete a coworker
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const resolvedParams = await params
        const coworkerId = resolvedParams.id

        // Delete coworker (cascade will handle interactions)
        const { error } = await supabase
            .from('coworkers')
            .delete()
            .eq('id', coworkerId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting coworker:', error)
            return NextResponse.json(
                { error: 'Failed to delete coworker' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete coworker API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
