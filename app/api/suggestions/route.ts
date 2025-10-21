import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch pending suggestions for the user
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
        const status = searchParams.get('status') || 'pending'
        const conversationId = searchParams.get('conversationId')

        // Build query
        let query = supabase
            .from('suggestions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', status)
            .order('created_at', { ascending: false })

        // Filter by conversation if provided
        if (conversationId) {
            query = query.eq('conversation_id', conversationId)
        }

        const { data: suggestions, error } = await query

        if (error) {
            console.error('Error fetching suggestions:', error)
            return NextResponse.json(
                { error: 'Failed to fetch suggestions' },
                { status: 500 }
            )
        }

        return NextResponse.json({ suggestions })

    } catch (error) {
        console.error('Suggestions API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
