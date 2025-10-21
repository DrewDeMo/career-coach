import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ExtractedSkill {
  skill_name: string
  category: string
  proficiency_level: number
  context: string
}

export interface ExtractedGoal {
  title: string
  description: string
  category: string
  target_date?: string
  context: string
}

export interface ExtractedProject {
  project_name: string
  description: string
  role: string
  technologies?: string[]
  start_date?: string
  end_date?: string
  context: string
}

export interface ExtractedChallenge {
  title: string
  description: string
  category: string
  context: string
}

export interface ExtractedAchievement {
  title: string
  description: string
  date?: string
  context: string
}

export interface ExtractedProfileUpdate {
  field: 'role_title' | 'company' | 'department' | 'years_experience' | 'industry' | 'responsibilities'
  value: string | string[]
  context: string
}

export interface ExtractedSkillUpdate {
  skill_name: string
  proficiency_level: number
  context: string
}

export interface ExtractedEntities {
  skills: ExtractedSkill[]
  skillUpdates: ExtractedSkillUpdate[]
  goals: ExtractedGoal[]
  projects: ExtractedProject[]
  challenges: ExtractedChallenge[]
  achievements: ExtractedAchievement[]
  profileUpdates: ExtractedProfileUpdate[]
}

const EXTRACTION_PROMPT = `You are an AI assistant that extracts structured career information from conversations.

Analyze the conversation and extract any NEW information about:
1. **Skills** - Technical or soft skills mentioned (with proficiency if stated)
2. **Goals** - Career objectives or aspirations
3. **Projects** - Work projects or initiatives
4. **Challenges** - Current obstacles or difficulties
5. **Achievements** - Accomplishments or milestones
6. **Profile Updates** - Changes to role, company, experience, etc.

IMPORTANT RULES:
- Only extract information that is EXPLICITLY stated or strongly implied
- Do NOT extract information that was already known (check existing context)
- **For skills**: If the user mentions an EXISTING skill with NEW proficiency information, suggest it as a skill update (not a new skill)
- **For skills**: Only suggest NEW skills if they are not already in the user's skill list
- Include the exact quote or context where the information was mentioned
- For skills, estimate proficiency (1-5) based on how they describe their experience
- For goals, categorize as: career_growth, skill_development, leadership, work_life_balance, other
- For challenges, categorize as: technical, interpersonal, workload, career_direction, other
- Return EMPTY arrays if no new information is found

Return a JSON object with this exact structure:
{
  "skills": [
    {
      "skill_name": "string",
      "category": "technical|soft_skill|domain_knowledge|tool|language|framework",
      "proficiency_level": 1-5,
      "is_update": false,
      "existing_skill_id": null,
      "context": "exact quote or context from conversation"
    }
  ],
  "skillUpdates": [
    {
      "skill_name": "string (must match existing skill)",
      "proficiency_level": 1-5,
      "context": "exact quote or context from conversation"
    }
  ],
  "goals": [
    {
      "title": "string",
      "description": "string",
      "category": "career_growth|skill_development|leadership|work_life_balance|other",
      "target_date": "YYYY-MM-DD (optional)",
      "context": "exact quote or context"
    }
  ],
  "projects": [
    {
      "project_name": "string",
      "description": "string",
      "role": "string",
      "technologies": ["string"],
      "start_date": "YYYY-MM-DD (optional)",
      "end_date": "YYYY-MM-DD (optional)",
      "context": "exact quote or context"
    }
  ],
  "challenges": [
    {
      "title": "string",
      "description": "string",
      "category": "technical|interpersonal|workload|career_direction|other",
      "context": "exact quote or context"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "description": "string",
      "date": "YYYY-MM-DD (optional)",
      "context": "exact quote or context"
    }
  ],
  "profileUpdates": [
    {
      "field": "role_title|company|department|years_experience|industry|responsibilities",
      "value": "string or array of strings",
      "context": "exact quote or context"
    }
  ]
}`

export async function extractEntitiesFromConversation(
  userMessage: string,
  assistantResponse: string,
  existingContext: {
    profile: any
    skills: any[]
    goals: any[]
    projects: any[]
  }
): Promise<ExtractedEntities> {
  try {
    const contextSummary = `
EXISTING USER CONTEXT (do not re-extract this information):
Profile: ${JSON.stringify(existingContext.profile, null, 2)}
Skills: ${(existingContext.skills || []).map(s => s.skill_name || s.name).join(', ')}
Goals: ${(existingContext.goals || []).map(g => g.title).join(', ')}
Projects: ${(existingContext.projects || []).map(p => p.name).join(', ')}

CONVERSATION TO ANALYZE:
User: ${userMessage}
Assistant: ${assistantResponse}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: contextSummary }
      ],
      temperature: 0.3, // Lower temperature for more consistent extraction
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from extraction API')
    }

    const extracted = JSON.parse(content) as ExtractedEntities

    // Validate and sanitize the extracted data
    return {
      skills: Array.isArray(extracted.skills) ? extracted.skills : [],
      skillUpdates: Array.isArray(extracted.skillUpdates) ? extracted.skillUpdates : [],
      goals: Array.isArray(extracted.goals) ? extracted.goals : [],
      projects: Array.isArray(extracted.projects) ? extracted.projects : [],
      challenges: Array.isArray(extracted.challenges) ? extracted.challenges : [],
      achievements: Array.isArray(extracted.achievements) ? extracted.achievements : [],
      profileUpdates: Array.isArray(extracted.profileUpdates) ? extracted.profileUpdates : []
    }
  } catch (error) {
    console.error('Entity extraction error:', error)
    // Return empty arrays on error rather than failing
    return {
      skills: [],
      skillUpdates: [],
      goals: [],
      projects: [],
      challenges: [],
      achievements: [],
      profileUpdates: []
    }
  }
}

export function hasExtractedEntities(entities: ExtractedEntities): boolean {
  return (
    entities.skills.length > 0 ||
    entities.skillUpdates.length > 0 ||
    entities.goals.length > 0 ||
    entities.projects.length > 0 ||
    entities.challenges.length > 0 ||
    entities.achievements.length > 0 ||
    entities.profileUpdates.length > 0
  )
}
