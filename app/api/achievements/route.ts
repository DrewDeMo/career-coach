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
        const search = searchParams.get('search')

        let query = supabase
            .from('achievements')
            .select('*')
            .eq('user_id', user.id)
            .order('achieved_date', { ascending: false })

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data: achievements, error } = await query

        if (error) {
            console.error('Error fetching achievements:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ achievements })
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
        const { title, description, impact } = body

        if (!title) {
            return NextResponse.json(
                { error: 'Achievement title is required' },
                { status: 400 }
            )
        }

        const { data: achievement, error } = await supabase
            .from('achievements')
            .insert({
                user_id: user.id,
                title,
                description,
                impact,
                achieved_date: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating achievement:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ achievement }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
