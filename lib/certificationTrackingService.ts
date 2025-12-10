// Certification Tracking Service - Track professional certifications and credentials
export interface Certification {
  id: string
  userId: string
  name: string
  issuer: string
  category: 'technical' | 'professional' | 'academic' | 'industry'
  subcategory: string
  description: string
  credentialId: string
  issueDate: Date
  expiryDate?: Date
  status: 'active' | 'expired' | 'suspended' | 'revoked'
  verificationUrl: string
  skills: string[]
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  cost: number
  studyHours: number
  prerequisites: string[]
  renewalRequirements: string[]
  lastRenewal?: Date
  nextRenewal?: Date
  isVerified: boolean
  verificationDate?: Date
  badgeUrl?: string
  transcriptUrl?: string
}

export interface CertificationProvider {
  id: string
  name: string
  website: string
  description: string
  categories: string[]
  popularCertifications: string[]
  averageCost: number
  averageStudyTime: number
  verificationMethod: 'api' | 'manual' | 'blockchain'
  apiEndpoint?: string
  isIntegrated: boolean
}

export interface CertificationGoal {
  id: string
  userId: string
  certificationId: string
  targetDate: Date
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  progress: number
  studyPlan: StudyPlan
  milestones: CertificationMilestone[]
  notes: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedCost: number
  actualCost?: number
  startDate?: Date
  completionDate?: Date
}

export interface StudyPlan {
  id: string
  totalHours: number
  weeks: number
  dailyHours: number
  resources: StudyResource[]
  practiceTests: PracticeTest[]
  studySchedule: StudySession[]
}

export interface StudyResource {
  id: string
  type: 'book' | 'video' | 'course' | 'practice' | 'documentation'
  title: string
  url?: string
  description: string
  estimatedHours: number
  completed: boolean
  rating?: number
  notes?: string
}

export interface PracticeTest {
  id: string
  title: string
  questions: number
  timeLimit: number
  passingScore: number
  attempts: number
  bestScore?: number
  lastAttempt?: Date
  url?: string
}

export interface StudySession {
  id: string
  date: Date
  duration: number
  topic: string
  resources: string[]
  notes: string
  progress: number
}

export interface CertificationMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  status: 'pending' | 'completed' | 'overdue'
  completedDate?: Date
  points: number
}

export interface CertificationInsight {
  id: string
  userId: string
  skill: string
  currentCertifications: string[]
  recommendedCertifications: string[]
  marketValue: number
  demandLevel: 'low' | 'medium' | 'high' | 'very-high'
  averageSalary: number
  careerPaths: string[]
  learningPath: string[]
}

class CertificationTrackingService {
  private certifications: Map<string, Certification> = new Map()
  private goals: Map<string, CertificationGoal> = new Map()
  private providers: Map<string, CertificationProvider> = new Map()

  constructor() {
    this.initializeProviders()
  }

  // Initialize certification providers
  private initializeProviders(): void {
    const providers: CertificationProvider[] = [
      {
        id: 'aws',
        name: 'Amazon Web Services',
        website: 'https://aws.amazon.com/certification/',
        description: 'Cloud computing and AWS services certifications',
        categories: ['cloud', 'devops', 'security', 'data'],
        popularCertifications: [
          'AWS Certified Solutions Architect',
          'AWS Certified Developer',
          'AWS Certified SysOps Administrator'
        ],
        averageCost: 150,
        averageStudyTime: 80,
        verificationMethod: 'api',
        apiEndpoint: 'https://aws.amazon.com/verification',
        isIntegrated: true
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        website: 'https://docs.microsoft.com/en-us/learn/certifications/',
        description: 'Microsoft technologies and cloud services',
        categories: ['cloud', 'development', 'security', 'data'],
        popularCertifications: [
          'Microsoft Azure Fundamentals',
          'Microsoft 365 Fundamentals',
          'Azure Developer Associate'
        ],
        averageCost: 165,
        averageStudyTime: 60,
        verificationMethod: 'api',
        isIntegrated: true
      },
      {
        id: 'google',
        name: 'Google Cloud',
        website: 'https://cloud.google.com/certification',
        description: 'Google Cloud Platform certifications',
        categories: ['cloud', 'data', 'machine-learning'],
        popularCertifications: [
          'Google Cloud Professional Data Engineer',
          'Google Cloud Professional Cloud Architect',
          'Google Cloud Professional Machine Learning Engineer'
        ],
        averageCost: 200,
        averageStudyTime: 100,
        verificationMethod: 'api',
        isIntegrated: true
      },
      {
        id: 'comptia',
        name: 'CompTIA',
        website: 'https://www.comptia.org/certifications',
        description: 'IT fundamentals and cybersecurity',
        categories: ['security', 'networking', 'fundamentals'],
        popularCertifications: [
          'CompTIA Security+',
          'CompTIA Network+',
          'CompTIA A+'
        ],
        averageCost: 370,
        averageStudyTime: 120,
        verificationMethod: 'manual',
        isIntegrated: false
      },
      {
        id: 'cisco',
        name: 'Cisco',
        website: 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications.html',
        description: 'Networking and cybersecurity certifications',
        categories: ['networking', 'security', 'collaboration'],
        popularCertifications: [
          'CCNA - Cisco Certified Network Associate',
          'CCNP - Cisco Certified Network Professional',
          'CCIE - Cisco Certified Internetwork Expert'
        ],
        averageCost: 300,
        averageStudyTime: 150,
        verificationMethod: 'manual',
        isIntegrated: false
      }
    ]

    providers.forEach(provider => {
      this.providers.set(provider.id, provider)
    })
  }

  // Add certification
  async addCertification(userId: string, certificationData: Partial<Certification>): Promise<Certification> {
    const certification: Certification = {
      id: this.generateId(),
      userId,
      name: certificationData.name || '',
      issuer: certificationData.issuer || '',
      category: certificationData.category || 'technical',
      subcategory: certificationData.subcategory || '',
      description: certificationData.description || '',
      credentialId: certificationData.credentialId || '',
      issueDate: certificationData.issueDate || new Date(),
      expiryDate: certificationData.expiryDate,
      status: certificationData.status || 'active',
      verificationUrl: certificationData.verificationUrl || '',
      skills: certificationData.skills || [],
      level: certificationData.level || 'intermediate',
      cost: certificationData.cost || 0,
      studyHours: certificationData.studyHours || 0,
      prerequisites: certificationData.prerequisites || [],
      renewalRequirements: certificationData.renewalRequirements || [],
      isVerified: certificationData.isVerified || false,
      verificationDate: certificationData.verificationDate,
      badgeUrl: certificationData.badgeUrl,
      transcriptUrl: certificationData.transcriptUrl
    }

    this.certifications.set(certification.id, certification)
    console.log(`✅ Added certification: ${certification.name}`)
    
    return certification
  }

  // Create certification goal
  async createCertificationGoal(
    userId: string,
    certificationId: string,
    targetDate: Date,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<CertificationGoal> {
    const certification = this.certifications.get(certificationId)
    if (!certification) {
      throw new Error('Certification not found')
    }

    const studyPlan = this.generateStudyPlan(certification)
    const milestones = this.generateMilestones(certification, targetDate)

    const goal: CertificationGoal = {
      id: this.generateId(),
      userId,
      certificationId,
      targetDate,
      status: 'planned',
      progress: 0,
      studyPlan,
      milestones,
      notes: '',
      priority,
      estimatedCost: certification.cost,
      startDate: new Date()
    }

    this.goals.set(goal.id, goal)
    console.log(`🎯 Created certification goal: ${certification.name}`)
    
    return goal
  }

  // Generate study plan
  private generateStudyPlan(certification: Certification): StudyPlan {
    const totalHours = certification.studyHours || 80
    const weeks = Math.ceil(totalHours / 10) // 10 hours per week
    const dailyHours = Math.ceil(totalHours / (weeks * 7))

    const resources: StudyResource[] = [
      {
        id: this.generateId(),
        type: 'course',
        title: `${certification.name} Official Course`,
        description: 'Official training course from the certification provider',
        estimatedHours: Math.floor(totalHours * 0.4),
        completed: false
      },
      {
        id: this.generateId(),
        type: 'book',
        title: `${certification.name} Study Guide`,
        description: 'Comprehensive study guide and reference book',
        estimatedHours: Math.floor(totalHours * 0.3),
        completed: false
      },
      {
        id: this.generateId(),
        type: 'practice',
        title: 'Practice Tests and Labs',
        description: 'Hands-on practice tests and lab exercises',
        estimatedHours: Math.floor(totalHours * 0.3),
        completed: false
      }
    ]

    const practiceTests: PracticeTest[] = [
      {
        id: this.generateId(),
        title: 'Official Practice Test 1',
        questions: 50,
        timeLimit: 90,
        passingScore: 70,
        attempts: 0
      },
      {
        id: this.generateId(),
        title: 'Official Practice Test 2',
        questions: 50,
        timeLimit: 90,
        passingScore: 70,
        attempts: 0
      }
    ]

    const studySchedule: StudySession[] = []
    const startDate = new Date()
    
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        if (day < 5) { // Weekdays only
          studySchedule.push({
            id: this.generateId(),
            date: new Date(startDate.getTime() + (week * 7 + day) * 24 * 60 * 60 * 1000),
            duration: dailyHours,
            topic: `Week ${week + 1} - Day ${day + 1}`,
            resources: [],
            notes: '',
            progress: 0
          })
        }
      }
    }

    return {
      id: this.generateId(),
      totalHours,
      weeks,
      dailyHours,
      resources,
      practiceTests,
      studySchedule
    }
  }

  // Generate milestones
  private generateMilestones(certification: Certification, targetDate: Date): CertificationMilestone[] {
    const milestones: CertificationMilestone[] = []
    const startDate = new Date()
    const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

    milestones.push({
      id: this.generateId(),
      title: 'Study Plan Created',
      description: 'Complete study plan and resource gathering',
      targetDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      points: 10
    })

    milestones.push({
      id: this.generateId(),
      title: '25% Study Complete',
      description: 'Complete 25% of study materials',
      targetDate: new Date(startDate.getTime() + (totalDays * 0.25) * 24 * 60 * 60 * 1000),
      status: 'pending',
      points: 25
    })

    milestones.push({
      id: this.generateId(),
      title: '50% Study Complete',
      description: 'Complete 50% of study materials',
      targetDate: new Date(startDate.getTime() + (totalDays * 0.5) * 24 * 60 * 60 * 1000),
      status: 'pending',
      points: 50
    })

    milestones.push({
      id: this.generateId(),
      title: 'Practice Test Passed',
      description: 'Pass official practice test with 80% or higher',
      targetDate: new Date(startDate.getTime() + (totalDays * 0.75) * 24 * 60 * 60 * 1000),
      status: 'pending',
      points: 75
    })

    milestones.push({
      id: this.generateId(),
      title: 'Certification Exam Passed',
      description: 'Successfully pass the certification exam',
      targetDate: targetDate,
      status: 'pending',
      points: 100
    })

    return milestones
  }

  // Update study progress
  async updateStudyProgress(
    goalId: string,
    sessionId: string,
    progress: number,
    notes?: string
  ): Promise<void> {
    const goal = this.goals.get(goalId)
    if (!goal) {
      throw new Error('Certification goal not found')
    }

    const session = goal.studyPlan.studySchedule.find(s => s.id === sessionId)
    if (!session) {
      throw new Error('Study session not found')
    }

    session.progress = progress
    session.notes = notes || session.notes

    // Update overall goal progress
    const totalSessions = goal.studyPlan.studySchedule.length
    const completedSessions = goal.studyPlan.studySchedule.filter(s => s.progress >= 100).length
    goal.progress = Math.round((completedSessions / totalSessions) * 100)

    // Check for milestone completion
    this.checkMilestoneCompletion(goal)

    this.goals.set(goalId, goal)
    console.log(`📚 Updated study progress for goal ${goalId}: ${goal.progress}%`)
  }

  // Check milestone completion
  private checkMilestoneCompletion(goal: CertificationGoal): void {
    const milestones = goal.milestones
    const progress = goal.progress

    milestones.forEach(milestone => {
      if (milestone.status === 'pending') {
        let shouldComplete = false

        switch (milestone.title) {
          case '25% Study Complete':
            shouldComplete = progress >= 25
            break
          case '50% Study Complete':
            shouldComplete = progress >= 50
            break
          case '75% Study Complete':
            shouldComplete = progress >= 75
            break
          case 'Practice Test Passed':
            // This would be set manually when practice test is passed
            break
          case 'Certification Exam Passed':
            // This would be set manually when exam is passed
            break
        }

        if (shouldComplete) {
          milestone.status = 'completed'
          milestone.completedDate = new Date()
          console.log(`🎉 Milestone completed: ${milestone.title}`)
        }
      }
    })
  }

  // Get certification insights
  async getCertificationInsights(userId: string): Promise<CertificationInsight[]> {
    const userCertifications = Array.from(this.certifications.values())
      .filter(cert => cert.userId === userId)

    const userGoals = Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)

    const insights: CertificationInsight[] = []

    // Analyze current certifications
    const skills = new Set<string>()
    userCertifications.forEach(cert => {
      cert.skills.forEach(skill => skills.add(skill))
    })

    for (const skill of skills) {
      const currentCerts = userCertifications
        .filter(cert => cert.skills.includes(skill))
        .map(cert => cert.name)

      const insight: CertificationInsight = {
        id: this.generateId(),
        userId,
        skill,
        currentCertifications: currentCerts,
        recommendedCertifications: this.getRecommendedCertifications(skill),
        marketValue: this.calculateMarketValue(skill),
        demandLevel: this.calculateDemandLevel(skill),
        averageSalary: this.calculateAverageSalary(skill),
        careerPaths: this.getCareerPaths(skill),
        learningPath: this.getLearningPath(skill)
      }

      insights.push(insight)
    }

    return insights
  }

  // Get recommended certifications
  private getRecommendedCertifications(skill: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      'AWS': [
        'AWS Certified Solutions Architect',
        'AWS Certified Developer',
        'AWS Certified DevOps Engineer'
      ],
      'Azure': [
        'Microsoft Azure Fundamentals',
        'Azure Developer Associate',
        'Azure Solutions Architect Expert'
      ],
      'Security': [
        'CompTIA Security+',
        'CISSP',
        'CISM'
      ],
      'Data': [
        'Google Cloud Professional Data Engineer',
        'AWS Certified Data Analytics',
        'Microsoft Azure Data Scientist'
      ]
    }

    for (const [key, certs] of Object.entries(recommendations)) {
      if (skill.toLowerCase().includes(key.toLowerCase())) {
        return certs
      }
    }

    return ['Recommended Certification 1', 'Recommended Certification 2']
  }

  // Calculate market value
  private calculateMarketValue(skill: string): number {
    const values: { [key: string]: number } = {
      'AWS': 120000,
      'Azure': 115000,
      'Security': 110000,
      'Data': 125000,
      'Machine Learning': 130000
    }

    for (const [key, value] of Object.entries(values)) {
      if (skill.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }

    return 100000
  }

  // Calculate demand level
  private calculateDemandLevel(skill: string): 'low' | 'medium' | 'high' | 'very-high' {
    const highDemandSkills = ['AWS', 'Azure', 'Security', 'Data', 'Machine Learning']
    
    if (highDemandSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
      return 'very-high'
    }
    
    return 'high'
  }

  // Calculate average salary
  private calculateAverageSalary(skill: string): number {
    return this.calculateMarketValue(skill)
  }

  // Get career paths
  private getCareerPaths(skill: string): string[] {
    return [
      'Senior Developer',
      'Technical Lead',
      'Architecture Consultant',
      'DevOps Engineer',
      'Cloud Solutions Architect'
    ]
  }

  // Get learning path
  private getLearningPath(skill: string): string[] {
    return [
      'Complete foundational courses',
      'Practice with hands-on labs',
      'Take practice exams',
      'Schedule certification exam',
      'Maintain certification with continuing education'
    ]
  }

  // Get all providers
  getProviders(): CertificationProvider[] {
    return Array.from(this.providers.values())
  }

  // Get user certifications
  getUserCertifications(userId: string): Certification[] {
    return Array.from(this.certifications.values())
      .filter(cert => cert.userId === userId)
  }

  // Get user goals
  getUserGoals(userId: string): CertificationGoal[] {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

export default CertificationTrackingService
