import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch interactions for a coworker or all interactions
export async function GET(request: NextRequest) {
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

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const coworkerId = searchParams.get('coworker_id')
        const sentiment = searchParams.get('sentiment')
        const interactionType = searchParams.get('interaction_type')

        // Build query
        let query = supabase
            .from('coworker_interactions')
            .select(`
                *,
                coworkers (
                    id,
                    name,
                    role,
                    department
                )
            `)
            .eq('user_id', user.id)
            .order('interaction_date', { ascending: false })

        // Apply filters
        if (coworkerId) {
            query = query.eq('coworker_id', coworkerId)
        }
        if (sentiment) {
            query = query.eq('sentiment', sentiment)
        }
        if (interactionType) {
            query = query.eq('interaction_type', interactionType)
        }

        const { data: interactions, error } = await query

        if (error) {
            console.error('Error fetching interactions:', error)
            return NextResponse.json(
                { error: 'Failed to fetch interactions' },
                { status: 500 }
            )
        }

        return NextResponse.json({ interactions })

    } catch (error) {
        console.error('Interactions API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// POST - Create a new interaction
export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const {
            coworker_id,
            interaction_date,
            interaction_type,
            sentiment,
            impact_on_career,
            description,
            outcomes,
            notes,
            related_project_id,
            related_goal_id,
            related_challenge_id
        } = body

        // Validate required fields
        if (!coworker_id || !interaction_type || !sentiment) {
            return NextResponse.json(
                { error: 'Coworker ID, interaction type, and sentiment are required' },
                { status: 400 }
            )
        }

        // Verify coworker belongs to user
        const { data: coworker, error: coworkerError } = await supabase
            .from('coworkers')
            .select('id')
            .eq('id', coworker_id)
            .eq('user_id', user.id)
            .single()

        if (coworkerError || !coworker) {
            return NextResponse.json(
                { error: 'Coworker not found' },
                { status: 404 }
            )
        }

        // Insert interaction
        const { data: interaction, error } = await supabase
            .from('coworker_interactions')
            .insert({
                user_id: user.id,
                coworker_id,
                interaction_date: interaction_date || new Date().toISOString(),
                interaction_type,
                sentiment,
                impact_on_career: impact_on_career || null,
                description: description || null,
                outcomes: outcomes || null,
                notes: notes || {},
                related_project_id: related_project_id || null,
                related_goal_id: related_goal_id || null,
                related_challenge_id: related_challenge_id || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating interaction:', error)
            return NextResponse.json(
                { error: 'Failed to create interaction' },
                { status: 500 }
            )
        }

        // Update coworker's last_interaction_date
        await supabase
            .from('coworkers')
            .update({ last_interaction_date: interaction_date || new Date().toISOString() })
            .eq('id', coworker_id)

        return NextResponse.json({ interaction }, { status: 201 })

    } catch (error) {
        console.error('Create interaction API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
