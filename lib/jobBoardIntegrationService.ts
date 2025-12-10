// Job Board Integration Service - Connect with job platforms
export interface JobBoardConnection {
  id: string
  userId: string
  platform: 'linkedin' | 'indeed' | 'glassdoor' | 'ziprecruiter' | 'monster'
  connectionName: string
  accessToken?: string
  apiKey?: string
  isActive: boolean
  lastSync: Date
  syncSettings: JobSyncSettings
}

export interface JobSyncSettings {
  syncJobAlerts: boolean
  syncApplications: boolean
  syncProfile: boolean
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  autoSync: boolean
  targetKeywords: string[]
  targetLocations: string[]
  salaryRange: {
    min: number
    max: number
  }
}

export interface JobPosting {
  id: string
  platform: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  benefits: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  postedDate: Date
  applicationUrl: string
  isApplied: boolean
  applicationDate?: Date
  status: 'interested' | 'applied' | 'interview' | 'rejected' | 'offered'
  skills: string[]
  matchScore: number
}

export interface JobApplication {
  id: string
  jobId: string
  platform: string
  appliedDate: Date
  status: 'submitted' | 'under-review' | 'interview' | 'rejected' | 'offered'
  notes?: string
  followUpDate?: Date
  interviewDate?: Date
  salaryOffered?: number
}

export interface CareerInsight {
  id: string
  userId: string
  skill: string
  demandLevel: 'low' | 'medium' | 'high' | 'very-high'
  averageSalary: number
  jobCount: number
  growthRate: number
  topCompanies: string[]
  relatedSkills: string[]
  learningRecommendations: string[]
}

class JobBoardIntegrationService {
  private connections: Map<string, JobBoardConnection> = new Map()
  private jobAlerts: Map<string, JobPosting[]> = new Map()

  // LinkedIn Integration
  async connectLinkedIn(userId: string, accessToken: string): Promise<JobBoardConnection> {
    try {
      console.log('🔗 Connecting to LinkedIn...')
      
      // Test connection
      const testResponse = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        throw new Error('Invalid LinkedIn access token')
      }

      const userData = await testResponse.json()
      
      const connection: JobBoardConnection = {
        id: this.generateId(),
        userId,
        platform: 'linkedin',
        connectionName: `LinkedIn - ${userData.firstName} ${userData.lastName}`,
        accessToken,
        isActive: true,
        lastSync: new Date(),
        syncSettings: {
          syncJobAlerts: true,
          syncApplications: true,
          syncProfile: true,
          syncFrequency: 'daily',
          autoSync: true,
          targetKeywords: [],
          targetLocations: [],
          salaryRange: { min: 50000, max: 150000 }
        }
      }

      this.connections.set(connection.id, connection)
      console.log('✅ LinkedIn connected successfully')
      
      return connection
    } catch (error) {
      console.error('❌ LinkedIn connection failed:', error)
      throw error
    }
  }

  // Indeed Integration (using Indeed API)
  async connectIndeed(userId: string, apiKey: string): Promise<JobBoardConnection> {
    try {
      console.log('🔗 Connecting to Indeed...')
      
      // Test connection with Indeed API
      const testResponse = await fetch(`https://api.indeed.com/ads/apisearch?publisher=${apiKey}&q=software&l=remote&format=json&v=2`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        throw new Error('Invalid Indeed API key')
      }

      const connection: JobBoardConnection = {
        id: this.generateId(),
        userId,
        platform: 'indeed',
        connectionName: 'Indeed Jobs',
        apiKey,
        isActive: true,
        lastSync: new Date(),
        syncSettings: {
          syncJobAlerts: true,
          syncApplications: false, // Indeed doesn't provide application tracking
          syncProfile: false,
          syncFrequency: 'daily',
          autoSync: true,
          targetKeywords: [],
          targetLocations: [],
          salaryRange: { min: 50000, max: 150000 }
        }
      }

      this.connections.set(connection.id, connection)
      console.log('✅ Indeed connected successfully')
      
      return connection
    } catch (error) {
      console.error('❌ Indeed connection failed:', error)
      throw error
    }
  }

  // Glassdoor Integration
  async connectGlassdoor(userId: string, partnerId: string, apiKey: string): Promise<JobBoardConnection> {
    try {
      console.log('🔗 Connecting to Glassdoor...')
      
      // Test connection with Glassdoor API
      const testResponse = await fetch(`https://api.glassdoor.com/api/api.htm?t.p=${partnerId}&t.k=${apiKey}&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&q=software`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        throw new Error('Invalid Glassdoor API credentials')
      }

      const connection: JobBoardConnection = {
        id: this.generateId(),
        userId,
        platform: 'glassdoor',
        connectionName: 'Glassdoor Jobs',
        apiKey: `${partnerId}:${apiKey}`,
        isActive: true,
        lastSync: new Date(),
        syncSettings: {
          syncJobAlerts: true,
          syncApplications: false,
          syncProfile: false,
          syncFrequency: 'daily',
          autoSync: true,
          targetKeywords: [],
          targetLocations: [],
          salaryRange: { min: 50000, max: 150000 }
        }
      }

      this.connections.set(connection.id, connection)
      console.log('✅ Glassdoor connected successfully')
      
      return connection
    } catch (error) {
      console.error('❌ Glassdoor connection failed:', error)
      throw error
    }
  }

  // Search jobs across platforms
  async searchJobs(
    connectionId: string,
    keywords: string[],
    location: string,
    filters?: {
      salaryMin?: number
      salaryMax?: number
      experienceLevel?: string
      employmentType?: string
      remote?: boolean
    }
  ): Promise<JobPosting[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Job board connection not found')
    }

    try {
      console.log(`🔍 Searching jobs on ${connection.platform}...`)
      
      let jobs: JobPosting[] = []

      switch (connection.platform) {
        case 'linkedin':
          jobs = await this.searchLinkedInJobs(connection, keywords, location, filters)
          break
        case 'indeed':
          jobs = await this.searchIndeedJobs(connection, keywords, location, filters)
          break
        case 'glassdoor':
          jobs = await this.searchGlassdoorJobs(connection, keywords, location, filters)
          break
        default:
          throw new Error(`Unsupported job platform: ${connection.platform}`)
      }

      // Calculate match scores based on user profile
      jobs = jobs.map(job => ({
        ...job,
        matchScore: this.calculateMatchScore(job, keywords, filters)
      }))

      // Sort by match score
      jobs.sort((a, b) => b.matchScore - a.matchScore)

      console.log(`✅ Found ${jobs.length} jobs on ${connection.platform}`)
      return jobs
    } catch (error) {
      console.error('❌ Job search failed:', error)
      throw error
    }
  }

  // LinkedIn job search
  private async searchLinkedInJobs(
    connection: JobBoardConnection,
    keywords: string[],
    location: string,
    filters?: any
  ): Promise<JobPosting[]> {
    const query = keywords.join(' ')
    const response = await fetch(
      `https://api.linkedin.com/v2/jobSearch?keywords=${encodeURIComponent(query)}&locationName=${encodeURIComponent(location)}&count=50`,
      {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search LinkedIn jobs')
    }

    const data = await response.json()
    const jobs = data.elements || []
    
    return jobs.map((job: any) => ({
      id: this.generateId(),
      platform: 'linkedin',
      title: job.title,
      company: job.companyDetails?.name || 'Unknown',
      location: job.location || location,
      description: job.description?.text || '',
      requirements: this.extractRequirements(job.description?.text || ''),
      benefits: this.extractBenefits(job.description?.text || ''),
      salary: job.salaryRange ? {
        min: job.salaryRange.start,
        max: job.salaryRange.end,
        currency: job.salaryRange.currencyCode || 'USD'
      } : undefined,
      employmentType: this.mapEmploymentType(job.jobType),
      experienceLevel: this.mapExperienceLevel(job.experienceLevel),
      postedDate: new Date(job.listedAt),
      applicationUrl: job.applyMethod?.landingPageUrl || '',
      isApplied: false,
      status: 'interested',
      skills: this.extractSkills(job.description?.text || ''),
      matchScore: 0
    }))
  }

  // Indeed job search
  private async searchIndeedJobs(
    connection: JobBoardConnection,
    keywords: string[],
    location: string,
    filters?: any
  ): Promise<JobPosting[]> {
    const query = keywords.join(' ')
    const response = await fetch(
      `https://api.indeed.com/ads/apisearch?publisher=${connection.apiKey}&q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&format=json&v=2&limit=50`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search Indeed jobs')
    }

    const data = await response.json()
    const jobs = data.results || []
    
    return jobs.map((job: any) => ({
      id: this.generateId(),
      platform: 'indeed',
      title: job.jobtitle,
      company: job.company,
      location: job.formattedLocation,
      description: job.snippet,
      requirements: this.extractRequirements(job.snippet),
      benefits: [],
      salary: job.salary ? {
        min: this.parseSalary(job.salary).min,
        max: this.parseSalary(job.salary).max,
        currency: 'USD'
      } : undefined,
      employmentType: 'full-time',
      experienceLevel: 'mid',
      postedDate: new Date(job.date),
      applicationUrl: job.url,
      isApplied: false,
      status: 'interested',
      skills: this.extractSkills(job.snippet),
      matchScore: 0
    }))
  }

  // Glassdoor job search
  private async searchGlassdoorJobs(
    connection: JobBoardConnection,
    keywords: string[],
    location: string,
    filters?: any
  ): Promise<JobPosting[]> {
    const [partnerId, apiKey] = connection.apiKey!.split(':')
    const query = keywords.join(' ')
    
    const response = await fetch(
      `https://api.glassdoor.com/api/api.htm?t.p=${partnerId}&t.k=${apiKey}&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search Glassdoor jobs')
    }

    const data = await response.json()
    const jobs = data.response?.jobs || []
    
    return jobs.map((job: any) => ({
      id: this.generateId(),
      platform: 'glassdoor',
      title: job.jobTitle,
      company: job.employerName,
      location: job.location,
      description: job.jobDescription,
      requirements: this.extractRequirements(job.jobDescription),
      benefits: this.extractBenefits(job.jobDescription),
      salary: job.salary ? {
        min: job.salary.min,
        max: job.salary.max,
        currency: 'USD'
      } : undefined,
      employmentType: 'full-time',
      experienceLevel: 'mid',
      postedDate: new Date(job.postedDate),
      applicationUrl: job.jobUrl,
      isApplied: false,
      status: 'interested',
      skills: this.extractSkills(job.jobDescription),
      matchScore: 0
    }))
  }

  // Track job application
  async trackApplication(jobId: string, platform: string, notes?: string): Promise<JobApplication> {
    const application: JobApplication = {
      id: this.generateId(),
      jobId,
      platform,
      appliedDate: new Date(),
      status: 'submitted',
      notes
    }

    console.log(`📝 Tracked application for job ${jobId} on ${platform}`)
    return application
  }

  // Get career insights
  async getCareerInsights(userId: string, skills: string[]): Promise<CareerInsight[]> {
    try {
      console.log('📊 Generating career insights...')
      
      const insights: CareerInsight[] = []

      for (const skill of skills) {
        // Mock career insight data
        const insight: CareerInsight = {
          id: this.generateId(),
          userId,
          skill,
          demandLevel: this.calculateDemandLevel(skill),
          averageSalary: this.calculateAverageSalary(skill),
          jobCount: Math.floor(Math.random() * 1000) + 100,
          growthRate: Math.floor(Math.random() * 20) + 5,
          topCompanies: this.getTopCompanies(skill),
          relatedSkills: this.getRelatedSkills(skill),
          learningRecommendations: this.getLearningRecommendations(skill)
        }

        insights.push(insight)
      }

      console.log(`✅ Generated insights for ${insights.length} skills`)
      return insights
    } catch (error) {
      console.error('❌ Career insights generation failed:', error)
      throw error
    }
  }

  // Helper methods
  private calculateMatchScore(job: JobPosting, keywords: string[], filters?: any): number {
    let score = 0

    // Keyword matching
    const jobText = `${job.title} ${job.description}`.toLowerCase()
    const matchedKeywords = keywords.filter(keyword => 
      jobText.includes(keyword.toLowerCase())
    )
    score += (matchedKeywords.length / keywords.length) * 40

    // Salary matching
    if (filters?.salaryMin && job.salary) {
      if (job.salary.min >= filters.salaryMin) {
        score += 20
      }
    }

    // Location matching
    if (filters?.location && job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      score += 15
    }

    // Experience level matching
    if (filters?.experienceLevel && job.experienceLevel === filters.experienceLevel) {
      score += 15
    }

    // Employment type matching
    if (filters?.employmentType && job.employmentType === filters.employmentType) {
      score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  private extractRequirements(description: string): string[] {
    const requirements = []
    const lines = description.split('\n')
    
    for (const line of lines) {
      if (line.toLowerCase().includes('requirement') || 
          line.toLowerCase().includes('must have') ||
          line.toLowerCase().includes('qualification')) {
        requirements.push(line.trim())
      }
    }
    
    return requirements.slice(0, 5) // Limit to 5 requirements
  }

  private extractBenefits(description: string): string[] {
    const benefits = []
    const lines = description.split('\n')
    
    for (const line of lines) {
      if (line.toLowerCase().includes('benefit') || 
          line.toLowerCase().includes('perk') ||
          line.toLowerCase().includes('offering')) {
        benefits.push(line.trim())
      }
    }
    
    return benefits.slice(0, 5) // Limit to 5 benefits
  }

  private extractSkills(description: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
      'Kubernetes', 'Git', 'Agile', 'Scrum', 'Machine Learning', 'Data Science',
      'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Cloud Computing'
    ]
    
    const foundSkills = commonSkills.filter(skill => 
      description.toLowerCase().includes(skill.toLowerCase())
    )
    
    return foundSkills
  }

  private mapEmploymentType(jobType: string): 'full-time' | 'part-time' | 'contract' | 'internship' {
    const type = jobType?.toLowerCase() || ''
    if (type.includes('part')) return 'part-time'
    if (type.includes('contract')) return 'contract'
    if (type.includes('intern')) return 'internship'
    return 'full-time'
  }

  private mapExperienceLevel(level: string): 'entry' | 'mid' | 'senior' | 'executive' {
    const lvl = level?.toLowerCase() || ''
    if (lvl.includes('entry') || lvl.includes('junior')) return 'entry'
    if (lvl.includes('senior') || lvl.includes('lead')) return 'senior'
    if (lvl.includes('executive') || lvl.includes('director')) return 'executive'
    return 'mid'
  }

  private parseSalary(salaryText: string): { min: number; max: number } {
    const numbers = salaryText.match(/\d+/g)
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0]) * 1000,
        max: parseInt(numbers[1]) * 1000
      }
    }
    return { min: 0, max: 0 }
  }

  private calculateDemandLevel(skill: string): 'low' | 'medium' | 'high' | 'very-high' {
    const highDemandSkills = ['JavaScript', 'Python', 'React', 'AWS', 'Machine Learning']
    const mediumDemandSkills = ['Java', 'Node.js', 'SQL', 'Docker', 'Git']
    
    if (highDemandSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
      return 'very-high'
    }
    if (mediumDemandSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
      return 'high'
    }
    return 'medium'
  }

  private calculateAverageSalary(skill: string): number {
    const salaryRanges: { [key: string]: number } = {
      'javascript': 95000,
      'python': 105000,
      'react': 100000,
      'aws': 110000,
      'machine learning': 120000,
      'java': 90000,
      'node.js': 95000,
      'sql': 85000,
      'docker': 100000,
      'git': 80000
    }
    
    const skillLower = skill.toLowerCase()
    for (const [key, salary] of Object.entries(salaryRanges)) {
      if (skillLower.includes(key)) {
        return salary
      }
    }
    
    return 80000 // Default salary
  }

  private getTopCompanies(skill: string): string[] {
    return ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb']
  }

  private getRelatedSkills(skill: string): string[] {
    const skillMap: { [key: string]: string[] } = {
      'javascript': ['React', 'Node.js', 'TypeScript', 'Vue.js', 'Angular'],
      'python': ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
      'react': ['JavaScript', 'TypeScript', 'Redux', 'Next.js', 'GraphQL'],
      'aws': ['Docker', 'Kubernetes', 'Terraform', 'Lambda', 'EC2']
    }
    
    const skillLower = skill.toLowerCase()
    for (const [key, related] of Object.entries(skillMap)) {
      if (skillLower.includes(key)) {
        return related
      }
    }
    
    return ['Related Skill 1', 'Related Skill 2', 'Related Skill 3']
  }

  private getLearningRecommendations(skill: string): string[] {
    return [
      `Complete ${skill} certification`,
      `Build projects using ${skill}`,
      `Join ${skill} community forums`,
      `Take advanced ${skill} courses`
    ]
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Get connection status
  getConnectionStatus(connectionId: string): { connected: boolean; lastSync: Date | null; error?: string } {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      return { connected: false, lastSync: null, error: 'Connection not found' }
    }

    return {
      connected: connection.isActive,
      lastSync: connection.lastSync,
      error: connection.isActive ? undefined : 'Connection inactive'
    }
  }

  // Disconnect job board
  async disconnectJobBoard(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Job board connection not found')
    }

    connection.isActive = false
    this.connections.set(connectionId, connection)
    console.log(`🔌 Disconnected from ${connection.platform}`)
  }

  // Get all connections
  getConnections(userId: string): JobBoardConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId)
  }
}

export default JobBoardIntegrationService
