import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all decisions for the user
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
        const status = searchParams.get('status')

        // Build query
        let query = supabase
            .from('decisions')
            .select('*')
            .eq('user_id', user.id)
            .order('decision_date', { ascending: false })

        // Apply filters
        if (status) {
            query = query.eq('status', status)
        }

        const { data: decisions, error } = await query

        if (error) {
            console.error('Error fetching decisions:', error)
            return NextResponse.json(
                { error: 'Failed to fetch decisions' },
                { status: 500 }
            )
        }

        return NextResponse.json({ decisions })

    } catch (error) {
        console.error('Decisions API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// POST - Create a new decision
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
            title,
            description,
            decision_date,
            reasoning,
            expected_outcome,
            actual_outcome,
            related_coworkers,
            related_goals,
            related_projects,
            status,
            lessons_learned,
            impact_score,
            confidence_level,
            tags
        } = body

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Insert decision
        const { data: decision, error } = await supabase
            .from('decisions')
            .insert({
                user_id: user.id,
                title,
                description: description || null,
                decision_date: decision_date || new Date().toISOString(),
                reasoning: reasoning || null,
                expected_outcome: expected_outcome || null,
                actual_outcome: actual_outcome || null,
                related_coworkers: related_coworkers || [],
                related_goals: related_goals || [],
                related_projects: related_projects || [],
                status: status || 'pending',
                lessons_learned: lessons_learned || null,
                impact_score: impact_score || null,
                confidence_level: confidence_level || null,
                tags: tags || []
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating decision:', error)
            return NextResponse.json(
                { error: 'Failed to create decision' },
                { status: 500 }
            )
        }

        return NextResponse.json({ decision }, { status: 201 })

    } catch (error) {
        console.error('Create decision API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
