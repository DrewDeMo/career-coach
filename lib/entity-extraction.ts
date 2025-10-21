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

export interface ExtractedCoworker {
  name: string
  role?: string
  department?: string
  seniority_level?: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'executive'
  relationship?: string
  influence_score?: number
  relationship_quality?: number
  trust_level?: number
  career_impact?: 'positive' | 'negative' | 'neutral'
  personality_traits?: Record<string, any>
  working_style?: Record<string, any>
  context: string
}

export interface ExtractedInteraction {
  coworker_name: string
  interaction_type: 'meeting' | 'conflict' | 'collaboration' | 'feedback' | 'casual' | 'email' | 'chat' | 'phone'
  sentiment: 'positive' | 'negative' | 'neutral'
  impact_on_career?: 'helped' | 'hindered' | 'neutral'
  description: string
  outcomes?: string
  interaction_date?: string
  context: string
}

export interface ExtractedDecision {
  title: string
  description: string
  reasoning?: string
  expected_outcome?: string
  related_coworkers?: string[]
  related_goals?: string[]
  impact_score?: number
  confidence_level?: number
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
  coworkers: ExtractedCoworker[]
  interactions: ExtractedInteraction[]
  decisions: ExtractedDecision[]
}

const EXTRACTION_PROMPT = `You are an AI assistant that extracts structured career information from conversations.

Analyze the conversation and extract any NEW information about:
1. **Skills** - Technical or soft skills mentioned (with proficiency if stated)
2. **Goals** - Career objectives or aspirations
3. **Projects** - Work projects or initiatives
4. **Challenges** - Current obstacles or difficulties
5. **Achievements** - Accomplishments or milestones
6. **Profile Updates** - Changes to role, company, experience, etc.
7. **Co-workers** - People mentioned by name who work with the user
8. **Interactions** - Specific interactions with co-workers (meetings, conflicts, collaborations)
9. **Decisions** - Important career decisions being considered or made

IMPORTANT RULES:
- Only extract information that is EXPLICITLY stated or strongly implied
- Do NOT extract information that was already known (check existing context)
- **For skills**: If the user mentions an EXISTING skill with NEW proficiency information, suggest it as a skill update (not a new skill)
- **For skills**: Only suggest NEW skills if they are not already in the user's skill list
- **For co-workers**: Extract names mentioned in professional context (colleagues, managers, team members) ONLY from the USER's message, NOT from the assistant's response
- **For co-workers**: Do NOT extract co-workers that are already in the existing context - they are already known
- **For co-workers**: If the assistant is simply listing existing co-workers, do NOT extract them as new co-workers
- **For interactions**: Only extract if specific interaction details are mentioned (not just name drops)
- Include the exact quote or context where the information was mentioned
- For skills, estimate proficiency (1-5) based on how they describe their experience
- For goals, categorize as: career_growth, skill_development, leadership, work_life_balance, other
- For challenges, categorize as: technical, interpersonal, workload, career_direction, other
- For co-workers, estimate influence_score (1-10), relationship_quality (1-10), trust_level (1-10) if mentioned
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
  ],
  "coworkers": [
    {
      "name": "string (person's name)",
      "role": "string (optional)",
      "department": "string (optional)",
      "seniority_level": "junior|mid|senior|lead|manager|director|vp|executive (optional)",
      "relationship": "string (optional)",
      "influence_score": 1-10 (optional, how much power they have),
      "relationship_quality": 1-10 (optional, how good the relationship is),
      "trust_level": 1-10 (optional, how trustworthy they are),
      "career_impact": "positive|negative|neutral (optional)",
      "personality_traits": {} (optional, any mentioned traits),
      "working_style": {} (optional, any mentioned style),
      "context": "exact quote or context"
    }
  ],
  "interactions": [
    {
      "coworker_name": "string (must match a co-worker name)",
      "interaction_type": "meeting|conflict|collaboration|feedback|casual|email|chat|phone",
      "sentiment": "positive|negative|neutral",
      "impact_on_career": "helped|hindered|neutral (optional)",
      "description": "string (what happened)",
      "outcomes": "string (optional, results of interaction)",
      "interaction_date": "YYYY-MM-DD (optional)",
      "context": "exact quote or context"
    }
  ],
  "decisions": [
    {
      "title": "string (decision being made)",
      "description": "string (details)",
      "reasoning": "string (optional, why considering this)",
      "expected_outcome": "string (optional, what they hope happens)",
      "related_coworkers": ["string"] (optional, names of involved people),
      "related_goals": ["string"] (optional, related goal titles),
      "impact_score": 1-10 (optional, how important),
      "confidence_level": 1-10 (optional, how confident they are),
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
    coworkers?: any[]
  }
): Promise<ExtractedEntities> {
  try {
    const contextSummary = `
EXISTING USER CONTEXT (do not re-extract this information):
Profile: ${JSON.stringify(existingContext.profile, null, 2)}
Skills: ${(existingContext.skills || []).map(s => s.skill_name || s.name).join(', ')}
Goals: ${(existingContext.goals || []).map(g => g.title).join(', ')}
Projects: ${(existingContext.projects || []).map(p => p.name).join(', ')}
Co-workers: ${(existingContext.coworkers || []).map(c => c.name).join(', ')}

CONVERSATION TO ANALYZE:
User: ${userMessage}
Assistant: ${assistantResponse}
`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
      profileUpdates: Array.isArray(extracted.profileUpdates) ? extracted.profileUpdates : [],
      coworkers: Array.isArray(extracted.coworkers) ? extracted.coworkers : [],
      interactions: Array.isArray(extracted.interactions) ? extracted.interactions : [],
      decisions: Array.isArray(extracted.decisions) ? extracted.decisions : []
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
      profileUpdates: [],
      coworkers: [],
      interactions: [],
      decisions: []
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
    entities.profileUpdates.length > 0 ||
    entities.coworkers.length > 0 ||
    entities.interactions.length > 0 ||
    entities.decisions.length > 0
  )
}
