import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

interface UserContext {
    profile: any
    skills: any[]
    goals: any[]
    recentProjects: any[]
}

async function getUserContext(userId: string): Promise<UserContext> {
    const supabase = await createClient()

    // Fetch career profile
    const { data: profile } = await supabase
        .from('career_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

    // Fetch skills
    const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', userId)
        .order('proficiency_level', { ascending: false })
        .limit(10)

    // Fetch active goals
    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch recent projects
    const { data: recentProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .limit(5)

    return {
        profile: profile || {},
        skills: skills || [],
        goals: goals || [],
        recentProjects: recentProjects || []
    }
}

function buildSystemPrompt(context: UserContext): string {
    const { profile, skills, goals, recentProjects } = context

    let prompt = `You are an expert AI career coach providing personalized guidance. You are supportive, insightful, and action-oriented.

# User's Career Profile
`

    if (profile.role_title) {
        prompt += `- Current Role: ${profile.role_title}\n`
    }
    if (profile.company) {
        prompt += `- Company: ${profile.company}\n`
    }
    if (profile.department) {
        prompt += `- Department: ${profile.department}\n`
    }
    if (profile.years_experience) {
        prompt += `- Years of Experience: ${profile.years_experience}\n`
    }
    if (profile.industry) {
        prompt += `- Industry: ${profile.industry}\n`
    }
    if (profile.responsibilities && Array.isArray(profile.responsibilities) && profile.responsibilities.length > 0) {
        prompt += `- Key Responsibilities: ${profile.responsibilities.join(', ')}\n`
    }

    if (skills.length > 0) {
        prompt += `\n# Current Skills\n`
        skills.forEach(skill => {
            prompt += `- ${skill.skill_name} (${skill.category || 'General'}) - Proficiency: ${skill.proficiency_level}/5\n`
        })
    }

    if (goals.length > 0) {
        prompt += `\n# Active Career Goals\n`
        goals.forEach(goal => {
            prompt += `- ${goal.title}`
            if (goal.description) {
                prompt += `: ${goal.description}`
            }
            if (goal.category) {
                prompt += ` [${goal.category}]`
            }
            prompt += `\n`
        })
    }

    if (recentProjects.length > 0) {
        prompt += `\n# Recent Projects\n`
        recentProjects.forEach(project => {
            prompt += `- ${project.project_name}`
            if (project.description) {
                prompt += `: ${project.description}`
            }
            prompt += `\n`
        })
    }

    prompt += `

# Your Role as Career Coach
- Provide personalized advice based on the user's profile, skills, and goals
- Be encouraging and supportive while being honest and realistic
- Suggest specific, actionable steps the user can take
- Help identify skill gaps and learning opportunities
- Assist with career planning, goal setting, and professional development
- Ask clarifying questions when needed to provide better guidance
- Keep responses concise but comprehensive (aim for 2-4 paragraphs)
- Use a warm, professional tone

# Guidelines
- Reference the user's specific context when relevant
- Provide concrete examples and resources when possible
- Help break down large goals into manageable steps
- Celebrate progress and achievements
- Be honest about challenges while maintaining optimism
- Respect the user's career choices and aspirations`

    return prompt
}

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

        const { message, conversationId, conversationHistory } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        // Get user context
        const context = await getUserContext(user.id)

        // Build system prompt with context
        const systemPrompt = buildSystemPrompt(context)

        // Build messages array for OpenAI (include conversation history if provided)
        const messages: any[] = [
            { role: 'system', content: systemPrompt }
        ]

        // Add conversation history if provided
        if (conversationHistory && Array.isArray(conversationHistory)) {
            conversationHistory.forEach((msg: any) => {
                messages.push({
                    role: msg.role,
                    content: msg.content
                })
            })
        }

        // Add current user message
        messages.push({ role: 'user', content: message })

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 1000
        })

        const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.'

        // Create new message objects
        const userMsg = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        }

        const assistantMsg = {
            role: 'assistant',
            content: assistantMessage,
            timestamp: new Date().toISOString()
        }

        // Update or create conversation
        if (conversationId) {
            // Fetch existing conversation
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('messages, title')
                .eq('id', conversationId)
                .eq('user_id', user.id)
                .single()

            if (existingConv) {
                const updatedMessages = [
                    ...(Array.isArray(existingConv.messages) ? existingConv.messages : []),
                    userMsg,
                    assistantMsg
                ]

                // Generate title from first message if not set
                let title = existingConv.title
                if (!title && updatedMessages.length === 2) {
                    title = message.substring(0, 50) + (message.length > 50 ? '...' : '')
                }

                await supabase
                    .from('conversations')
                    .update({
                        messages: updatedMessages,
                        title,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', conversationId)
            }
        } else {
            // Create new conversation
            const title = message.substring(0, 50) + (message.length > 50 ? '...' : '')

            await supabase.from('conversations').insert({
                user_id: user.id,
                title,
                messages: [userMsg, assistantMsg]
            })
        }

        return NextResponse.json({
            message: assistantMessage,
            tokensUsed: completion.usage?.total_tokens || 0
        })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
