// Enhanced Learning Path Service with robust GPT integration and error handling
import { GoogleCalendarService } from './googleCalendar'
import EnhancedGPTService from './enhancedGptService'
import LearningPathDatabaseService from './learningPathDatabaseService'

export interface LearningGoal {
  id: string
  title: string
  description: string
  category: 'academic' | 'career' | 'skill' | 'certification'
  priority: 'low' | 'medium' | 'high' | 'critical'
  targetDate: Date
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'overdue'
  prerequisites: string[]
  estimatedHours: number
  progress: number
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  resources: LearningResource[]
  dependencies: string[]
  notes: string
  completedDate?: Date
  startedDate?: Date
  rating?: number
  timeSpent: number
  milestones: Milestone[]
  calendarEvents: CalendarEvent[]
}

export interface LearningResource {
  id: string
  title: string
  type: 'video' | 'article' | 'book' | 'course' | 'practice' | 'project'
  url?: string
  completed: boolean
  estimatedTime?: number
  actualTime?: number
  rating?: number
  notes?: string
  source?: 'coursera' | 'udemy' | 'youtube' | 'khan' | 'custom'
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: Date
  status: 'pending' | 'achieved' | 'overdue'
  completedDate?: Date
  celebrationMessage?: string
  points: number
  badge?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  eventType: 'study' | 'practice' | 'review' | 'assessment'
  location?: string
  googleEventId?: string
}

export interface LearningPath {
  id: string
  name: string
  description: string
  totalDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedCompletion?: Date
  progress: number
  tags: string[]
  category: string
  isActive: boolean
  startDate?: Date
  completedDate?: Date
  rating?: number
  prerequisites: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  timeCommitment: number
  careerOutcomes: string[]
  skillsGained: string[]
  certifications: string[]
  goals: LearningGoal[]
  milestones: Milestone[]
}

export interface UserProfile {
  id: string
  userId: string
  university?: string
  major?: string
  year?: string
  interests: string[]
  careerGoals: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  timeAvailability: {
    weekdays: number
    weekends: number
    preferredTimes: string[]
  }
  currentSkills: string[]
  targetSkills: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface LearningAnalytics {
  totalGoals: number
  completedGoals: number
  averageProgress: number
  timeSpent: number
  streak: number
  efficiency: number
  motivation: number
  weeklyProgress: WeeklyProgress[]
  skillProgress: SkillProgress[]
  timeDistribution: TimeDistribution[]
}

export interface WeeklyProgress {
  week: string
  goalsCompleted: number
  timeSpent: number
  progress: number
}

export interface SkillProgress {
  skill: string
  currentLevel: number
  targetLevel: number
  progress: number
}

export interface TimeDistribution {
  category: string
  hours: number
  percentage: number
}

class EnhancedLearningPathService {
  private gptService: EnhancedGPTService
  private calendarService: GoogleCalendarService
  private databaseService: LearningPathDatabaseService

  constructor() {
    this.gptService = new EnhancedGPTService()
    this.calendarService = new GoogleCalendarService()
    this.databaseService = new LearningPathDatabaseService()
  }

  // Generate intelligent learning path with enhanced error handling
  async generateLearningPath(userProfile: UserProfile, careerGoal: string): Promise<LearningPath> {
    try {
      console.log('🚀 Generating intelligent learning path...')
      
      // Generate AI-powered learning path
      const aiResponse = await this.gptService.generateLearningPath(userProfile, careerGoal)
      
      // Parse the AI response
      let pathData
      try {
        pathData = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse
      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', parseError)
        throw new Error('Invalid AI response format')
      }

      // Create learning path object
      const learningPath: LearningPath = {
        id: this.generateId(),
        name: pathData.name || `Learning Path for ${careerGoal}`,
        description: pathData.description || 'AI-generated learning path',
        totalDuration: pathData.totalDuration || 12,
        difficulty: pathData.difficulty || 'intermediate',
        progress: 0,
        tags: pathData.tags || [],
        category: careerGoal,
        isActive: true,
        prerequisites: pathData.prerequisites || [],
        learningStyle: userProfile.learningStyle,
        timeCommitment: userProfile.timeAvailability.weekdays + userProfile.timeAvailability.weekends,
        careerOutcomes: pathData.careerOutcomes || [],
        skillsGained: pathData.skillsGained || [],
        certifications: pathData.certifications || [],
        goals: [],
        milestones: []
      }

      // Process goals from AI response
      if (pathData.goals && Array.isArray(pathData.goals)) {
        learningPath.goals = pathData.goals.map((goalData: any, index: number) => {
          const goal: LearningGoal = {
            id: this.generateId(),
            title: goalData.title || `Goal ${index + 1}`,
            description: goalData.description || '',
            category: goalData.category || 'skill',
            priority: goalData.priority || 'medium',
            targetDate: goalData.targetDate ? new Date(goalData.targetDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'not-started',
            prerequisites: goalData.prerequisites || [],
            estimatedHours: goalData.estimatedHours || 20,
            progress: 0,
            tags: goalData.tags || [],
            difficulty: goalData.difficulty || 'beginner',
            resources: [],
            dependencies: goalData.dependencies || [],
            notes: '',
            timeSpent: 0,
            milestones: [],
            calendarEvents: []
          }

          // Process milestones for this goal
          if (goalData.milestones && Array.isArray(goalData.milestones)) {
            goal.milestones = goalData.milestones.map((milestoneData: any) => ({
              id: this.generateId(),
              title: milestoneData.title || 'Milestone',
              description: milestoneData.description || '',
              targetDate: milestoneData.targetDate ? new Date(milestoneData.targetDate) : new Date(),
              status: 'pending' as const,
              celebrationMessage: milestoneData.celebrationMessage || 'Great job!',
              points: milestoneData.points || 50,
              badge: milestoneData.badge
            }))
          }

          return goal
        })
      }

      // Process path-level milestones
      if (pathData.milestones && Array.isArray(pathData.milestones)) {
        learningPath.milestones = pathData.milestones.map((milestoneData: any) => ({
          id: this.generateId(),
          title: milestoneData.title || 'Path Milestone',
          description: milestoneData.description || '',
          targetDate: milestoneData.targetDate ? new Date(milestoneData.targetDate) : new Date(),
          status: 'pending' as const,
          celebrationMessage: milestoneData.celebrationMessage || 'Excellent progress!',
          points: milestoneData.points || 100,
          badge: milestoneData.badge
        }))
      }

      // Save to database
      await this.databaseService.createLearningPath(learningPath)

      console.log('✅ Learning path generated successfully')
      return learningPath

    } catch (error) {
      console.error('❌ Error generating learning path:', error)
      
      // Return a fallback learning path
      return this.getFallbackLearningPath(careerGoal, userProfile)
    }
  }

  // Track progress with enhanced analytics
  async trackProgress(goalId: string, progress: number, timeSpent: number): Promise<void> {
    try {
      console.log(`📊 Tracking progress for goal ${goalId}: ${progress}%`)
      
      // Update goal progress
      await this.databaseService.updateGoalProgress(goalId, progress, timeSpent)
      
      // Update analytics
      await this.databaseService.updateDailyAnalytics(goalId, progress, timeSpent)
      
      // Check for milestone completions
      await this.checkMilestoneCompletions(goalId, progress)
      
      console.log('✅ Progress tracked successfully')
    } catch (error) {
      console.error('❌ Error tracking progress:', error)
      throw error
    }
  }

  // Get comprehensive analytics with AI insights
  async getAnalytics(userId: string): Promise<LearningAnalytics> {
    try {
      console.log(`📈 Generating analytics for user ${userId}`)
      
      // Get raw analytics data
      const rawAnalytics = await this.databaseService.getUserAnalytics(userId)
      
      // Calculate enhanced metrics
      const analytics: LearningAnalytics = {
        totalGoals: rawAnalytics.totalGoals || 0,
        completedGoals: rawAnalytics.completedGoals || 0,
        averageProgress: this.calculateAverageProgress(rawAnalytics),
        timeSpent: rawAnalytics.timeSpent || 0,
        streak: await this.databaseService.calculateUserStreak(userId),
        efficiency: this.calculateEfficiency(rawAnalytics),
        motivation: this.calculateMotivation(rawAnalytics),
        weeklyProgress: this.calculateWeeklyProgress(rawAnalytics),
        skillProgress: this.calculateSkillProgress(rawAnalytics),
        timeDistribution: this.calculateTimeDistribution(rawAnalytics)
      }

      console.log('✅ Analytics generated successfully')
      return analytics
    } catch (error) {
      console.error('❌ Error generating analytics:', error)
      
      // Return fallback analytics
      return this.getFallbackAnalytics()
    }
  }

  // Generate AI-powered recommendations
  async generateRecommendations(goal: LearningGoal, progress: number): Promise<any[]> {
    try {
      console.log(`🤖 Generating AI recommendations for goal: ${goal.title}`)
      
      const recommendations = await this.gptService.generateStudyRecommendations(goal, progress)
      
      // Save recommendations to database
      for (const rec of recommendations) {
        await this.databaseService.createAIRecommendation(goal.id, rec)
      }
      
      console.log('✅ Recommendations generated successfully')
      return recommendations
    } catch (error) {
      console.error('❌ Error generating recommendations:', error)
      
      // Return fallback recommendations
      return this.getFallbackRecommendations(goal)
    }
  }

  // Generate career analysis
  async generateCareerAnalysis(careerGoal: string, currentSkills: string[]): Promise<any> {
    try {
      console.log(`🎯 Generating career analysis for: ${careerGoal}`)
      
      const analysis = await this.gptService.analyzeCareerPath(careerGoal, currentSkills)
      
      console.log('✅ Career analysis generated successfully')
      return analysis
    } catch (error) {
      console.error('❌ Error generating career analysis:', error)
      
      // Return fallback analysis
      return this.getFallbackCareerAnalysis(careerGoal)
    }
  }

  // Generate motivational insights
  async generateMotivationalInsights(analytics: LearningAnalytics): Promise<any> {
    try {
      console.log('💪 Generating motivational insights')
      
      const insights = await this.gptService.generateMotivationalInsights(analytics)
      
      console.log('✅ Motivational insights generated successfully')
      return insights
    } catch (error) {
      console.error('❌ Error generating motivational insights:', error)
      
      // Return fallback insights
      return this.getFallbackMotivationalInsights()
    }
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private calculateAverageProgress(rawAnalytics: any): number {
    if (!rawAnalytics.totalGoals || rawAnalytics.totalGoals === 0) return 0
    return (rawAnalytics.completedGoals / rawAnalytics.totalGoals) * 100
  }

  private calculateEfficiency(rawAnalytics: any): number {
    // Simple efficiency calculation based on progress vs time spent
    if (!rawAnalytics.timeSpent || rawAnalytics.timeSpent === 0) return 0
    const progressPerHour = (rawAnalytics.averageProgress || 0) / (rawAnalytics.timeSpent / 60)
    return Math.min(100, progressPerHour * 10) // Scale to 0-100
  }

  private calculateMotivation(rawAnalytics: any): number {
    // Calculate motivation based on streak and consistency
    const streakBonus = Math.min(50, (rawAnalytics.streak || 0) * 5)
    const progressBonus = Math.min(50, (rawAnalytics.averageProgress || 0) / 2)
    return streakBonus + progressBonus
  }

  private calculateWeeklyProgress(rawAnalytics: any): WeeklyProgress[] {
    // Mock weekly progress data
    return [
      { week: 'Week 1', goalsCompleted: 2, timeSpent: 8, progress: 25 },
      { week: 'Week 2', goalsCompleted: 3, timeSpent: 12, progress: 45 },
      { week: 'Week 3', goalsCompleted: 1, timeSpent: 6, progress: 60 },
      { week: 'Week 4', goalsCompleted: 4, timeSpent: 16, progress: 80 }
    ]
  }

  private calculateSkillProgress(rawAnalytics: any): SkillProgress[] {
    // Mock skill progress data
    return [
      { skill: 'JavaScript', currentLevel: 7, targetLevel: 10, progress: 70 },
      { skill: 'React', currentLevel: 5, targetLevel: 8, progress: 62 },
      { skill: 'Node.js', currentLevel: 3, targetLevel: 7, progress: 43 }
    ]
  }

  private calculateTimeDistribution(rawAnalytics: any): TimeDistribution[] {
    // Mock time distribution data
    return [
      { category: 'Study', hours: 20, percentage: 50 },
      { category: 'Practice', hours: 12, percentage: 30 },
      { category: 'Review', hours: 8, percentage: 20 }
    ]
  }

  private async checkMilestoneCompletions(goalId: string, progress: number): Promise<void> {
    // Check if any milestones should be completed based on progress
    // Implementation would check milestone criteria and mark as achieved
  }

  // Fallback methods for when AI services fail
  private getFallbackLearningPath(careerGoal: string, userProfile: UserProfile): LearningPath {
    return {
      id: this.generateId(),
      name: `Learning Path for ${careerGoal}`,
      description: 'A structured learning path to achieve your career goals',
      totalDuration: 12,
      difficulty: 'intermediate',
      progress: 0,
      tags: ['learning', 'career-development'],
      category: careerGoal,
      isActive: true,
      prerequisites: [],
      learningStyle: userProfile.learningStyle,
      timeCommitment: userProfile.timeAvailability.weekdays + userProfile.timeAvailability.weekends,
      careerOutcomes: [careerGoal],
      skillsGained: ['Problem Solving', 'Critical Thinking'],
      certifications: [],
      goals: [],
      milestones: []
    }
  }

  private getFallbackAnalytics(): LearningAnalytics {
    return {
      totalGoals: 0,
      completedGoals: 0,
      averageProgress: 0,
      timeSpent: 0,
      streak: 0,
      efficiency: 0,
      motivation: 0,
      weeklyProgress: [],
      skillProgress: [],
      timeDistribution: []
    }
  }

  private getFallbackRecommendations(goal: LearningGoal): any[] {
    return [
      {
        type: 'resource',
        title: 'Study Resources',
        description: 'Focus on high-quality learning materials',
        priority: 'high',
        actionItems: ['Find relevant textbooks', 'Watch tutorial videos'],
        estimatedImpact: 80
      }
    ]
  }

  private getFallbackCareerAnalysis(careerGoal: string): any {
    return {
      career: careerGoal,
      requiredSkills: ['Communication', 'Problem Solving', 'Technical Skills'],
      skillGaps: ['Advanced Technical Skills'],
      learningPath: ['Learn fundamentals', 'Practice regularly', 'Build projects'],
      timeToAchieve: 12,
      difficulty: 'intermediate',
      marketDemand: 'medium',
      salaryRange: { min: 50000, max: 80000 },
      jobGrowth: 10,
      recommendations: ['Focus on practical skills', 'Build a portfolio']
    }
  }

  private getFallbackMotivationalInsights(): any {
    return {
      insights: ['You\'re making progress on your learning journey'],
      motivationalMessage: 'Keep up the great work! Every step forward counts.',
      nextSteps: ['Set daily study goals', 'Track your progress', 'Celebrate small wins']
    }
  }
}

export default EnhancedLearningPathService
