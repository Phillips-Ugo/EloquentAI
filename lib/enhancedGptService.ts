// Enhanced GPT Service with robust error handling, rate limiting, and fallback mechanisms
export interface GPTResponse {
  content: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface LearningRecommendation {
  type: 'resource' | 'schedule' | 'technique' | 'motivation'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
  estimatedImpact: number
}

export interface CareerPathAnalysis {
  career: string
  requiredSkills: string[]
  skillGaps: string[]
  learningPath: string[]
  timeToAchieve: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  marketDemand: 'low' | 'medium' | 'high'
  salaryRange: {
    min: number
    max: number
  }
  jobGrowth: number
  recommendations: string[]
}

export interface GPTError {
  code: string
  message: string
  retryable: boolean
  fallbackUsed: boolean
}

class EnhancedGPTService {
  private apiKey: string
  private baseUrl: string = 'https://api.openai.com/v1'
  private rateLimitQueue: Array<() => Promise<any>> = []
  private isProcessingQueue: boolean = false
  private requestCount: number = 0
  private lastResetTime: number = Date.now()
  private maxRequestsPerMinute: number = 60
  private retryAttempts: number = 3
  private retryDelay: number = 1000 // 1 second

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY not found. GPT features will use mock responses.')
    }
  }

  // Rate limiting and queue management
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.rateLimitQueue.length > 0) {
      const now = Date.now()
      
      // Reset counter every minute
      if (now - this.lastResetTime >= 60000) {
        this.requestCount = 0
        this.lastResetTime = now
      }

      // Check rate limit
      if (this.requestCount >= this.maxRequestsPerMinute) {
        const waitTime = 60000 - (now - this.lastResetTime)
        console.log(`⏳ Rate limit reached. Waiting ${waitTime}ms...`)
        await this.delay(waitTime)
        continue
      }

      const request = this.rateLimitQueue.shift()
      if (request) {
        try {
          await request()
          this.requestCount++
        } catch (error) {
          console.error('❌ Request failed:', error)
        }
      }
    }

    this.isProcessingQueue = false
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Enhanced error handling with retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'GPT API call'
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`⚠️ ${context} failed (attempt ${attempt}/${this.retryAttempts}):`, error)

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.log(`🔄 Retrying in ${delay}ms...`)
          await this.delay(delay)
        }
      }
    }

    throw new Error(`${context} failed after ${this.retryAttempts} attempts: ${lastError?.message}`)
  }

  // Generate intelligent learning path recommendations
  async generateLearningPath(userProfile: any, careerGoal: string): Promise<any> {
    const prompt = `
      You are an expert learning path advisor. Create a comprehensive, personalized learning path for a student.

      Student Profile:
      - University: ${userProfile.university || 'Not specified'}
      - Major: ${userProfile.major || 'Not specified'}
      - Year: ${userProfile.year || 'Not specified'}
      - Current Skills: ${userProfile.currentSkills?.join(', ') || 'None specified'}
      - Target Skills: ${userProfile.targetSkills?.join(', ') || 'None specified'}
      - Learning Style: ${userProfile.learningStyle || 'mixed'}
      - Time Available: ${userProfile.timeAvailability?.weekdays || 2} hours/weekdays, ${userProfile.timeAvailability?.weekends || 4} hours/weekends
      - Career Goal: ${careerGoal}

      Create a detailed learning path with the following structure:
      {
        "name": "Comprehensive [Career Goal] Learning Path",
        "description": "Detailed description of the learning path",
        "totalDuration": 12,
        "difficulty": "intermediate",
        "goals": [
          {
            "title": "Goal title",
            "description": "Detailed description",
            "category": "skill|academic|career|certification",
            "priority": "high|medium|low",
            "estimatedHours": 20,
            "difficulty": "beginner|intermediate|advanced",
            "prerequisites": ["prerequisite1", "prerequisite2"],
            "dependencies": ["goal_id_1"],
            "tags": ["tag1", "tag2"],
            "milestones": [
              {
                "title": "Milestone title",
                "description": "Milestone description",
                "targetDate": "2024-02-15",
                "points": 50,
                "celebrationMessage": "Great job!"
              }
            ]
          }
        ],
        "milestones": [
          {
            "title": "Foundation Complete",
            "description": "Completed all foundational concepts",
            "targetDate": "2024-03-01",
            "goals": ["goal1", "goal2"],
            "rewards": ["Certificate of Completion"],
            "points": 100,
            "celebrationMessage": "Excellent progress!"
          }
        ],
        "prerequisites": ["Basic programming knowledge"],
        "tags": ["programming", "career-development"],
        "careerOutcomes": ["Software Developer", "Technical Lead"],
        "skillsGained": ["React", "Node.js", "Database Design"],
        "certifications": ["AWS Certified Developer"]
      }

      Make it practical, achievable, and tailored to the student's current level and time constraints.
    `

    return await this.generateResponseWithFallback(prompt, 'learning path generation')
  }

  // Generate personalized study recommendations
  async generateStudyRecommendations(goal: any, progress: number): Promise<LearningRecommendation[]> {
    const prompt = `
      Analyze this learning goal and provide personalized recommendations:

      Goal: ${goal.title}
      Description: ${goal.description}
      Current Progress: ${progress}%
      Time Spent: ${goal.timeSpent || 0} hours
      Estimated Time: ${goal.estimatedHours} hours
      Difficulty: ${goal.difficulty}
      Learning Style: ${goal.learningStyle || 'mixed'}

      Provide 3-5 specific recommendations in this JSON format:
      [
        {
          "type": "resource|schedule|technique|motivation",
          "title": "Recommendation title",
          "description": "Detailed explanation",
          "priority": "high|medium|low",
          "actionItems": ["Action 1", "Action 2"],
          "estimatedImpact": 85
        }
      ]

      Focus on:
      - Specific resources or courses
      - Study techniques that match their learning style
      - Time management strategies
      - Motivation techniques
      - Practice methods
    `

    const response = await this.generateResponseWithFallback(prompt, 'study recommendations')
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('❌ Failed to parse study recommendations:', error)
      return this.getMockStudyRecommendations()
    }
  }

  // Analyze career path and provide insights
  async analyzeCareerPath(careerGoal: string, currentSkills: string[]): Promise<CareerPathAnalysis> {
    const prompt = `
      Analyze the career path for: ${careerGoal}

      Current Skills: ${currentSkills.join(', ')}

      Provide a comprehensive career analysis in this JSON format:
      {
        "career": "${careerGoal}",
        "requiredSkills": ["skill1", "skill2"],
        "skillGaps": ["gap1", "gap2"],
        "learningPath": ["step1", "step2"],
        "timeToAchieve": 18,
        "difficulty": "intermediate",
        "marketDemand": "high",
        "salaryRange": {
          "min": 70000,
          "max": 120000
        },
        "jobGrowth": 15,
        "recommendations": ["rec1", "rec2"]
      }

      Include current market data and realistic timelines.
    `

    const response = await this.generateResponseWithFallback(prompt, 'career analysis')
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('❌ Failed to parse career analysis:', error)
      return this.getMockCareerAnalysis(careerGoal)
    }
  }

  // Generate motivational content and progress insights
  async generateMotivationalInsights(analytics: any): Promise<{
    insights: string[]
    motivationalMessage: string
    nextSteps: string[]
  }> {
    const prompt = `
      Based on this learning analytics data, provide motivational insights:

      Total Goals: ${analytics.totalGoals || 0}
      Completed Goals: ${analytics.completedGoals || 0}
      Average Progress: ${analytics.averageProgress || 0}%
      Time Spent: ${analytics.timeSpent || 0} hours
      Current Streak: ${analytics.streak || 0} days
      Efficiency: ${analytics.efficiency || 0}%

      Provide:
      1. 3-4 key insights about their learning patterns
      2. A motivational message (2-3 sentences)
      3. 3 specific next steps to improve

      Format as JSON:
      {
        "insights": ["insight1", "insight2"],
        "motivationalMessage": "Your motivational message here",
        "nextSteps": ["step1", "step2", "step3"]
      }
    `

    const response = await this.generateResponseWithFallback(prompt, 'motivational insights')
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('❌ Failed to parse motivational insights:', error)
      return this.getMockMotivationalInsights(analytics)
    }
  }

  // Generate adaptive learning suggestions
  async generateAdaptiveSuggestions(goal: any, performance: any): Promise<{
    adjustments: string[]
    newResources: string[]
    scheduleChanges: string[]
  }> {
    const prompt = `
      Analyze learning performance and suggest adaptations:

      Goal: ${goal.title}
      Progress: ${goal.progress}%
      Time Spent: ${goal.timeSpent} hours
      Estimated Time: ${goal.estimatedHours} hours
      Performance Metrics: ${JSON.stringify(performance)}

      Suggest adaptive changes in JSON format:
      {
        "adjustments": ["adjustment1", "adjustment2"],
        "newResources": ["resource1", "resource2"],
        "scheduleChanges": ["change1", "change2"]
      }

      Consider:
      - If they're ahead/behind schedule
      - Learning style optimization
      - Resource effectiveness
      - Time management improvements
    `

    const response = await this.generateResponseWithFallback(prompt, 'adaptive suggestions')
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('❌ Failed to parse adaptive suggestions:', error)
      return this.getMockAdaptiveSuggestions()
    }
  }

  // Enhanced GPT API call with comprehensive error handling
  async generateResponseWithFallback(prompt: string, context: string, maxTokens: number = 2000): Promise<any> {
    if (!this.apiKey) {
      console.log(`🔄 No API key available, using mock response for ${context}`)
      return this.getMockResponse(prompt, context)
    }

    try {
      return await this.executeWithRetry(async () => {
        return await this.callGPTAPI(prompt, maxTokens)
      }, context)
    } catch (error) {
      console.error(`❌ ${context} failed, using fallback:`, error)
      return this.getMockResponse(prompt, context)
    }
  }

  // Core GPT API call
  private async callGPTAPI(prompt: string, maxTokens: number = 2000): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning advisor and educational consultant. Provide detailed, practical, and actionable advice for students and professionals pursuing learning goals. Always respond with valid JSON when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GPT API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from GPT API')
    }

    return data.choices[0].message.content
  }

  // Enhanced mock responses for development/testing
  private getMockResponse(prompt: string, context: string): any {
    console.log(`🎭 Using mock response for ${context}`)
    
    if (context.includes('learning path')) {
      return this.getMockLearningPath()
    }
    
    if (context.includes('recommendations')) {
      return JSON.stringify(this.getMockStudyRecommendations())
    }
    
    if (context.includes('career')) {
      return JSON.stringify(this.getMockCareerAnalysis('Software Developer'))
    }
    
    if (context.includes('motivational')) {
      return JSON.stringify(this.getMockMotivationalInsights({}))
    }
    
    if (context.includes('adaptive')) {
      return JSON.stringify(this.getMockAdaptiveSuggestions())
    }

    return "Mock response for development"
  }

  private getMockLearningPath(): string {
    return JSON.stringify({
      name: "Full-Stack Development Learning Path",
      description: "Comprehensive path to become a full-stack developer with modern technologies",
      totalDuration: 16,
      difficulty: "intermediate",
      goals: [
        {
          title: "Master HTML & CSS Fundamentals",
          description: "Learn modern HTML5 and CSS3 with responsive design principles",
          category: "skill",
          priority: "high",
          estimatedHours: 40,
          difficulty: "beginner",
          prerequisites: [],
          dependencies: [],
          tags: ["web-development", "frontend"],
          milestones: [
            {
              title: "Responsive Design Mastery",
              description: "Complete responsive design project",
              targetDate: "2024-02-15",
              points: 50,
              celebrationMessage: "Great job on responsive design!"
            }
          ]
        },
        {
          title: "JavaScript Deep Dive",
          description: "Master JavaScript ES6+, async programming, and DOM manipulation",
          category: "skill",
          priority: "high",
          estimatedHours: 60,
          difficulty: "intermediate",
          prerequisites: ["HTML & CSS"],
          dependencies: ["goal1"],
          tags: ["javascript", "programming"],
          milestones: [
            {
              title: "ES6+ Features Complete",
              description: "Master all ES6+ features",
              targetDate: "2024-03-01",
              points: 75,
              celebrationMessage: "Excellent JavaScript progress!"
            }
          ]
        }
      ],
      milestones: [
        {
          title: "Frontend Foundation Complete",
          description: "Completed all frontend fundamentals",
          targetDate: "2024-03-15",
          goals: ["goal1", "goal2"],
          rewards: ["Frontend Developer Badge"],
          points: 200,
          celebrationMessage: "Great job building your frontend foundation!"
        }
      ],
      prerequisites: ["Basic computer skills"],
      tags: ["web-development", "full-stack"],
      careerOutcomes: ["Frontend Developer", "Full-Stack Developer"],
      skillsGained: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
      certifications: ["Web Development Certificate"]
    })
  }

  private getMockStudyRecommendations(): LearningRecommendation[] {
    return [
      {
        type: "resource",
        title: "Interactive Coding Practice",
        description: "Use platforms like Codecademy or freeCodeCamp for hands-on practice",
        priority: "high",
        actionItems: ["Sign up for Codecademy Pro", "Complete 3 exercises daily"],
        estimatedImpact: 90
      },
      {
        type: "technique",
        title: "Pomodoro Study Method",
        description: "Use 25-minute focused study sessions with 5-minute breaks",
        priority: "medium",
        actionItems: ["Download Pomodoro timer app", "Schedule study blocks"],
        estimatedImpact: 75
      },
      {
        type: "motivation",
        title: "Progress Tracking",
        description: "Track your daily progress and celebrate small wins",
        priority: "high",
        actionItems: ["Set up progress tracking", "Celebrate weekly milestones"],
        estimatedImpact: 80
      }
    ]
  }

  private getMockCareerAnalysis(career: string): CareerPathAnalysis {
    return {
      career,
      requiredSkills: ["JavaScript", "React", "Node.js", "Database Design", "Git"],
      skillGaps: ["Advanced React Patterns", "System Design", "DevOps"],
      learningPath: [
        "Master JavaScript fundamentals",
        "Learn React and modern frontend development",
        "Study backend development with Node.js",
        "Understand database design and management",
        "Learn deployment and DevOps practices"
      ],
      timeToAchieve: 18,
      difficulty: "intermediate",
      marketDemand: "high",
      salaryRange: {
        min: 70000,
        max: 120000
      },
      jobGrowth: 15,
      recommendations: [
        "Focus on building real projects",
        "Contribute to open source",
        "Network with other developers",
        "Stay updated with latest technologies"
      ]
    }
  }

  private getMockMotivationalInsights(analytics: any): {
    insights: string[]
    motivationalMessage: string
    nextSteps: string[]
  } {
    return {
      insights: [
        "You're making consistent progress on your learning goals",
        "Your study sessions are well-distributed throughout the week",
        "You're maintaining a good balance between different subjects"
      ],
      motivationalMessage: "Your dedication to learning is impressive! Keep up the great work and remember that every small step counts towards your bigger goals.",
      nextSteps: [
        "Set a specific time for daily study sessions",
        "Join a study group for accountability",
        "Track your progress weekly to stay motivated"
      ]
    }
  }

  private getMockAdaptiveSuggestions(): {
    adjustments: string[]
    newResources: string[]
    scheduleChanges: string[]
  } {
    return {
      adjustments: [
        "Increase study session length to 45 minutes",
        "Add more hands-on practice exercises",
        "Focus on areas where you're struggling"
      ],
      newResources: [
        "Interactive coding challenges on LeetCode",
        "Video tutorials on YouTube",
        "Practice projects on GitHub"
      ],
      scheduleChanges: [
        "Study in the morning when you're most focused",
        "Take longer breaks between sessions",
        "Schedule review sessions weekly"
      ]
    }
  }
}

export default EnhancedGPTService
