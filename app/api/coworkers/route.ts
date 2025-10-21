import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all coworkers for the user
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

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url)
        const department = searchParams.get('department')
        const careerImpact = searchParams.get('career_impact')
        const search = searchParams.get('search')

        // Build query
        let query = supabase
            .from('coworkers')
            .select('*')
            .eq('user_id', user.id)
            .order('influence_score', { ascending: false, nullsFirst: false })

        // Apply filters
        if (department) {
            query = query.eq('department', department)
        }
        if (careerImpact) {
            query = query.eq('career_impact', careerImpact)
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,role.ilike.%${search}%`)
        }

        const { data: coworkers, error } = await query

        if (error) {
            console.error('Error fetching coworkers:', error)
            return NextResponse.json(
                { error: 'Failed to fetch coworkers' },
                { status: 500 }
            )
        }

        return NextResponse.json({ coworkers })

    } catch (error) {
        console.error('Coworkers API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// POST - Create a new coworker
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
            name,
            role,
            department,
            seniority_level,
            relationship,
            communication_style,
            influence_score,
            relationship_quality,
            trust_level,
            personality_traits,
            working_style,
            career_impact,
            interaction_frequency,
            notes
        } = body

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        // Insert coworker
        const { data: coworker, error } = await supabase
            .from('coworkers')
            .insert({
                user_id: user.id,
                name,
                role: role || null,
                department: department || null,
                seniority_level: seniority_level || null,
                relationship: relationship || null,
                communication_style: communication_style || null,
                influence_score: influence_score || null,
                relationship_quality: relationship_quality || null,
                trust_level: trust_level || null,
                personality_traits: personality_traits || {},
                working_style: working_style || {},
                career_impact: career_impact || null,
                interaction_frequency: interaction_frequency || null,
                notes: notes || {}
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating coworker:', error)
            return NextResponse.json(
                { error: 'Failed to create coworker' },
                { status: 500 }
            )
        }

        return NextResponse.json({ coworker }, { status: 201 })

    } catch (error) {
        console.error('Create coworker API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
