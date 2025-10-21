import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { extractEntitiesFromConversation, hasExtractedEntities } from '@/lib/entity-extraction'

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

async function saveSuggestions(
    supabase: any,
    userId: string,
    conversationId: string,
    entities: any
) {
    const suggestions = []

    // Valid entity types according to database constraint
    const validEntityTypes = ['skill', 'skill_update', 'goal', 'project', 'challenge', 'achievement', 'profile_update']

    // Helper function to validate and create suggestion
    const createSuggestion = (entityType: string, entityData: any, context: string) => {
        if (!validEntityTypes.includes(entityType)) {
            console.warn(`Invalid entity type: ${entityType}`)
            return null
        }
        if (!context || typeof context !== 'string') {
            console.warn(`Missing or invalid context for entity type: ${entityType}`)
            return null
        }
        return {
            user_id: userId,
            conversation_id: conversationId,
            entity_type: entityType,
            entity_data: entityData,
            context: context
        }
    }

    // Add new skills
    if (Array.isArray(entities.skills)) {
        for (const skill of entities.skills) {
            const suggestion = createSuggestion('skill', skill, skill.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    // Add skill updates
    if (Array.isArray(entities.skillUpdates)) {
        for (const skillUpdate of entities.skillUpdates) {
            const suggestion = createSuggestion('skill_update', skillUpdate, skillUpdate.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    // Add goals
    if (Array.isArray(entities.goals)) {
        for (const goal of entities.goals) {
            const suggestion = createSuggestion('goal', goal, goal.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    // Add projects
    if (Array.isArray(entities.projects)) {
        for (const project of entities.projects) {
            const suggestion = createSuggestion('project', project, project.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    // Add challenges
    if (Array.isArray(entities.challenges)) {
        for (const challenge of entities.challenges) {
            const suggestion = createSuggestion('challenge', challenge, challenge.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    // Add achievements
    if (Array.isArray(entities.achievements)) {
        for (const achievement of entities.achievements) {
            const suggestion = createSuggestion('achievement', achievement, achievement.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    // Add profile updates
    if (Array.isArray(entities.profileUpdates)) {
        for (const update of entities.profileUpdates) {
            const suggestion = createSuggestion('profile_update', update, update.context)
            if (suggestion) suggestions.push(suggestion)
        }
    }

    if (suggestions.length > 0) {
        console.log(`Attempting to save ${suggestions.length} suggestions`)
        const { error } = await supabase.from('suggestions').insert(suggestions)
        if (error) {
            console.error('Error saving suggestions:', error)
            // Log the first failed suggestion for debugging
            if (suggestions.length > 0) {
                console.error('First suggestion that failed:', JSON.stringify(suggestions[0], null, 2))
            }
        } else {
            console.log(`Successfully saved ${suggestions.length} suggestions`)
        }
    }
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

        const { message, conversationId, conversationHistory, stream = true } = await request.json()

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

        // If streaming is requested, use streaming API
        if (stream) {
            const encoder = new TextEncoder()
            const streamResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: true
            })

            let fullContent = ''
            let totalTokens = 0

            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of streamResponse) {
                            const content = chunk.choices[0]?.delta?.content || ''
                            if (content) {
                                fullContent += content
                                // Send the chunk to the client
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                            }
                        }

                        // Ensure we got some content
                        if (!fullContent) {
                            throw new Error('No content received from AI')
                        }

                        // After streaming is complete, save to database
                        const userMsg = {
                            role: 'user',
                            content: message,
                            timestamp: new Date().toISOString()
                        }

                        const assistantMsg = {
                            role: 'assistant',
                            content: fullContent,
                            timestamp: new Date().toISOString()
                        }

                        // Extract entities from the conversation
                        let extractedEntities = null
                        try {
                            extractedEntities = await extractEntitiesFromConversation(
                                message,
                                fullContent,
                                context
                            )
                        } catch (extractError) {
                            console.error('Entity extraction error:', extractError)
                            // Continue even if extraction fails
                        }

                        // Update or create conversation
                        try {
                            if (conversationId) {
                                const { data: existingConv, error: fetchError } = await supabase
                                    .from('conversations')
                                    .select('messages, title')
                                    .eq('id', conversationId)
                                    .eq('user_id', user.id)
                                    .single()

                                if (fetchError) {
                                    console.error('Error fetching conversation:', fetchError)
                                    throw fetchError
                                }

                                if (existingConv) {
                                    const updatedMessages = [
                                        ...(Array.isArray(existingConv.messages) ? existingConv.messages : []),
                                        userMsg,
                                        assistantMsg
                                    ]

                                    let title = existingConv.title
                                    if (!title && updatedMessages.length === 2) {
                                        title = message.substring(0, 50) + (message.length > 50 ? '...' : '')
                                    }

                                    const { error: updateError } = await supabase
                                        .from('conversations')
                                        .update({
                                            messages: updatedMessages,
                                            title,
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', conversationId)

                                    if (updateError) {
                                        console.error('Error updating conversation:', updateError)
                                        throw updateError
                                    }

                                    // Save extracted entities as suggestions if any were found
                                    if (extractedEntities && hasExtractedEntities(extractedEntities)) {
                                        await saveSuggestions(supabase, user.id, conversationId, extractedEntities)
                                    }
                                }
                            } else {
                                const title = message.substring(0, 50) + (message.length > 50 ? '...' : '')
                                const { data: newConv, error: insertError } = await supabase
                                    .from('conversations')
                                    .insert({
                                        user_id: user.id,
                                        title,
                                        messages: [userMsg, assistantMsg]
                                    })
                                    .select('id')
                                    .single()

                                if (insertError) {
                                    console.error('Error creating conversation:', insertError)
                                    throw insertError
                                }

                                // Save extracted entities as suggestions if any were found
                                if (newConv && extractedEntities && hasExtractedEntities(extractedEntities)) {
                                    await saveSuggestions(supabase, user.id, newConv.id, extractedEntities)
                                }
                            }
                        } catch (dbError) {
                            console.error('Database error during streaming:', dbError)
                            // Still send completion but log the error
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ warning: 'Message saved locally but database sync failed' })}\n\n`))
                        }

                        // Send completion signal
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, tokensUsed: totalTokens })}\n\n`))
                        controller.close()
                    } catch (error) {
                        console.error('Streaming error:', error)
                        const errorMessage = error instanceof Error ? error.message : 'Streaming failed'
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
                        controller.close()
                    }
                }
            })

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            })
        }

        // Non-streaming fallback (original implementation)
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 1000
        })

        const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.'

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

        if (conversationId) {
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
