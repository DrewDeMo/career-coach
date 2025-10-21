import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch all conversations for the user, ordered by most recent
        const { data: conversations, error: conversationsError } = await supabase
            .from('conversations')
            .select('id, title, messages, created_at, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (conversationsError) {
            console.error('Error fetching conversations:', conversationsError)
            return NextResponse.json(
                { error: 'Failed to fetch conversations' },
                { status: 500 }
            )
        }

        // Transform conversations to include message count and preview
        const transformedConversations = conversations.map(conv => {
            const messages = Array.isArray(conv.messages) ? conv.messages : []
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

            return {
                id: conv.id,
                title: conv.title || 'New Conversation',
                messageCount: messages.length,
                lastMessage: lastMessage ? {
                    content: lastMessage.content?.substring(0, 100) || '',
                    role: lastMessage.role,
                    timestamp: lastMessage.timestamp
                } : null,
                createdAt: conv.created_at,
                updatedAt: conv.updated_at
            }
        })

        return NextResponse.json({ conversations: transformedConversations })
    } catch (error) {
        console.error('Error in conversations API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { title } = body

        // Create new conversation
        const { data: conversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                user_id: user.id,
                title: title || 'New Conversation',
                messages: []
            })
            .select()
            .single()

        if (createError) {
            console.error('Error creating conversation:', createError)
            return NextResponse.json(
                { error: 'Failed to create conversation' },
                { status: 500 }
            )
        }

        return NextResponse.json({ conversation })
    } catch (error) {
        console.error('Error in conversations POST API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const conversationId = searchParams.get('id')

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID required' },
                { status: 400 }
            )
        }

        // Delete conversation
        const { error: deleteError } = await supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Error deleting conversation:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete conversation' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in conversations DELETE API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
