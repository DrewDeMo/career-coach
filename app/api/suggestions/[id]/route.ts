import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH - Accept or reject a suggestion
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

        const { action } = await request.json()
        const resolvedParams = await params
        const suggestionId = resolvedParams.id

        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "accept" or "reject"' },
                { status: 400 }
            )
        }

        // Fetch the suggestion
        const { data: suggestion, error: fetchError } = await supabase
            .from('suggestions')
            .select('*')
            .eq('id', suggestionId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !suggestion) {
            return NextResponse.json(
                { error: 'Suggestion not found' },
                { status: 404 }
            )
        }

        if (suggestion.status !== 'pending') {
            return NextResponse.json(
                { error: 'Suggestion has already been processed' },
                { status: 400 }
            )
        }

        // If accepting, insert the data into the appropriate table
        if (action === 'accept') {
            const entityData = suggestion.entity_data
            let insertError = null

            switch (suggestion.entity_type) {
                case 'skill':
                    const { error: skillError } = await supabase.from('skills').insert({
                        user_id: user.id,
                        name: entityData.skill_name,
                        category: entityData.category,
                        proficiency_level: getProficiencyLevel(entityData.proficiency_level)
                    })
                    insertError = skillError
                    break

                case 'skill_update':
                    // Find the existing skill by name
                    const { data: existingSkill, error: findError } = await supabase
                        .from('skills')
                        .select('id')
                        .eq('user_id', user.id)
                        .ilike('name', entityData.skill_name)
                        .single()

                    if (findError || !existingSkill) {
                        insertError = findError || new Error('Skill not found')
                        break
                    }

                    // Update the skill's proficiency level
                    const { error: updateSkillError } = await supabase
                        .from('skills')
                        .update({
                            proficiency_level: getProficiencyLevel(entityData.proficiency_level)
                        })
                        .eq('id', existingSkill.id)

                    insertError = updateSkillError
                    break

                case 'goal':
                    const { error: goalError } = await supabase.from('goals').insert({
                        user_id: user.id,
                        title: entityData.title,
                        description: entityData.description,
                        category: entityData.category,
                        target_date: entityData.target_date || null,
                        status: 'active'
                    })
                    insertError = goalError
                    break

                case 'project':
                    const { error: projectError } = await supabase.from('projects').insert({
                        user_id: user.id,
                        name: entityData.project_name,
                        description: entityData.description,
                        status: 'active',
                        technologies: entityData.technologies || [],
                        start_date: entityData.start_date || null,
                        end_date: entityData.end_date || null
                    })
                    insertError = projectError
                    break

                case 'challenge':
                    const { error: challengeError } = await supabase.from('challenges').insert({
                        user_id: user.id,
                        title: entityData.title,
                        description: entityData.description,
                        category: entityData.category,
                        status: 'active'
                    })
                    insertError = challengeError
                    break

                case 'achievement':
                    const { error: achievementError } = await supabase.from('achievements').insert({
                        user_id: user.id,
                        title: entityData.title,
                        description: entityData.description,
                        achieved_date: entityData.date || null
                    })
                    insertError = achievementError
                    break

                case 'profile_update':
                    // Fetch current profile
                    const { data: profile, error: profileFetchError } = await supabase
                        .from('career_profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single()

                    if (profileFetchError || !profile) {
                        insertError = profileFetchError || new Error('Profile not found')
                        break
                    }

                    // Update the specific field
                    const updateData: any = {}
                    updateData[entityData.field] = entityData.value

                    const { error: profileUpdateError } = await supabase
                        .from('career_profiles')
                        .update(updateData)
                        .eq('user_id', user.id)

                    insertError = profileUpdateError
                    break

                default:
                    return NextResponse.json(
                        { error: 'Unknown entity type' },
                        { status: 400 }
                    )
            }

            if (insertError) {
                console.error('Error inserting entity:', insertError)
                return NextResponse.json(
                    { error: 'Failed to save entity to database' },
                    { status: 500 }
                )
            }
        }

        // Update suggestion status
        const { error: updateError } = await supabase
            .from('suggestions')
            .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
            .eq('id', suggestionId)

        if (updateError) {
            console.error('Error updating suggestion:', updateError)
            return NextResponse.json(
                { error: 'Failed to update suggestion status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: `Suggestion ${action}ed successfully`
        })

    } catch (error) {
        console.error('Suggestion action API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// DELETE - Delete a suggestion
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
        const suggestionId = resolvedParams.id

        const { error } = await supabase
            .from('suggestions')
            .delete()
            .eq('id', suggestionId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting suggestion:', error)
            return NextResponse.json(
                { error: 'Failed to delete suggestion' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete suggestion API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// Helper function to convert numeric proficiency to text
function getProficiencyLevel(level: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (level <= 1) return 'beginner'
    if (level <= 2) return 'intermediate'
    if (level <= 4) return 'advanced'
    return 'expert'
}
