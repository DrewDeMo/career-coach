import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch specific conversation
        const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (conversationError) {
            console.error('Error fetching conversation:', conversationError)
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ conversation })
    } catch (error) {
        console.error('Error in conversation GET API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
