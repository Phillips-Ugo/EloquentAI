// LMS Integration Service - Connect with Learning Management Systems
export interface LMSConnection {
  id: string
  userId: string
  lmsType: 'canvas' | 'blackboard' | 'moodle' | 'schoology' | 'brightspace'
  connectionName: string
  baseUrl: string
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  isActive: boolean
  lastSync: Date
  syncSettings: LMSSyncSettings
}

export interface LMSSyncSettings {
  syncCourses: boolean
  syncAssignments: boolean
  syncGrades: boolean
  syncAnnouncements: boolean
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  autoSync: boolean
}

export interface LMSCourse {
  id: string
  lmsId: string
  name: string
  code: string
  description?: string
  startDate: Date
  endDate: Date
  credits: number
  instructor: string
  status: 'active' | 'completed' | 'upcoming'
  assignments: LMSAssignment[]
  announcements: LMSAnnouncement[]
}

export interface LMSAssignment {
  id: string
  courseId: string
  title: string
  description?: string
  dueDate: Date
  points: number
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded'
  grade?: number
  feedback?: string
  submissionUrl?: string
}

export interface LMSAnnouncement {
  id: string
  courseId: string
  title: string
  content: string
  postedDate: Date
  author: string
  isRead: boolean
}

export interface LMSGrade {
  id: string
  courseId: string
  assignmentId: string
  grade: number
  maxPoints: number
  percentage: number
  feedback?: string
  gradedDate: Date
}

class LMSIntegrationService {
  private connections: Map<string, LMSConnection> = new Map()

  // Canvas LMS Integration
  async connectCanvas(userId: string, apiKey: string, baseUrl: string): Promise<LMSConnection> {
    try {
      console.log('🔗 Connecting to Canvas LMS...')
      
      // Test connection
      const testResponse = await fetch(`${baseUrl}/api/v1/users/self`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        throw new Error('Invalid Canvas API credentials')
      }

      const userData = await testResponse.json()
      
      const connection: LMSConnection = {
        id: this.generateId(),
        userId,
        lmsType: 'canvas',
        connectionName: `Canvas - ${userData.name}`,
        baseUrl,
        apiKey,
        isActive: true,
        lastSync: new Date(),
        syncSettings: {
          syncCourses: true,
          syncAssignments: true,
          syncGrades: true,
          syncAnnouncements: true,
          syncFrequency: 'daily',
          autoSync: true
        }
      }

      this.connections.set(connection.id, connection)
      console.log('✅ Canvas LMS connected successfully')
      
      return connection
    } catch (error) {
      console.error('❌ Canvas LMS connection failed:', error)
      throw error
    }
  }

  // Blackboard LMS Integration
  async connectBlackboard(userId: string, accessToken: string, baseUrl: string): Promise<LMSConnection> {
    try {
      console.log('🔗 Connecting to Blackboard LMS...')
      
      // Test connection
      const testResponse = await fetch(`${baseUrl}/learn/api/public/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        throw new Error('Invalid Blackboard access token')
      }

      const userData = await testResponse.json()
      
      const connection: LMSConnection = {
        id: this.generateId(),
        userId,
        lmsType: 'blackboard',
        connectionName: `Blackboard - ${userData.name}`,
        baseUrl,
        accessToken,
        isActive: true,
        lastSync: new Date(),
        syncSettings: {
          syncCourses: true,
          syncAssignments: true,
          syncGrades: true,
          syncAnnouncements: true,
          syncFrequency: 'daily',
          autoSync: true
        }
      }

      this.connections.set(connection.id, connection)
      console.log('✅ Blackboard LMS connected successfully')
      
      return connection
    } catch (error) {
      console.error('❌ Blackboard LMS connection failed:', error)
      throw error
    }
  }

  // Moodle LMS Integration
  async connectMoodle(userId: string, token: string, baseUrl: string): Promise<LMSConnection> {
    try {
      console.log('🔗 Connecting to Moodle LMS...')
      
      // Test connection
      const testResponse = await fetch(`${baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          wstoken: token,
          wsfunction: 'core_webservice_get_site_info',
          moodlewsrestformat: 'json'
        })
      })

      if (!testResponse.ok) {
        throw new Error('Invalid Moodle token')
      }

      const userData = await testResponse.json()
      
      const connection: LMSConnection = {
        id: this.generateId(),
        userId,
        lmsType: 'moodle',
        connectionName: `Moodle - ${userData.fullname}`,
        baseUrl,
        apiKey: token,
        isActive: true,
        lastSync: new Date(),
        syncSettings: {
          syncCourses: true,
          syncAssignments: true,
          syncGrades: true,
          syncAnnouncements: true,
          syncFrequency: 'daily',
          autoSync: true
        }
      }

      this.connections.set(connection.id, connection)
      console.log('✅ Moodle LMS connected successfully')
      
      return connection
    } catch (error) {
      console.error('❌ Moodle LMS connection failed:', error)
      throw error
    }
  }

  // Sync courses from LMS
  async syncCourses(connectionId: string): Promise<LMSCourse[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('LMS connection not found')
    }

    try {
      console.log(`🔄 Syncing courses from ${connection.lmsType}...`)
      
      let courses: LMSCourse[] = []

      switch (connection.lmsType) {
        case 'canvas':
          courses = await this.syncCanvasCourses(connection)
          break
        case 'blackboard':
          courses = await this.syncBlackboardCourses(connection)
          break
        case 'moodle':
          courses = await this.syncMoodleCourses(connection)
          break
        default:
          throw new Error(`Unsupported LMS type: ${connection.lmsType}`)
      }

      // Update last sync time
      connection.lastSync = new Date()
      this.connections.set(connectionId, connection)

      console.log(`✅ Synced ${courses.length} courses from ${connection.lmsType}`)
      return courses
    } catch (error) {
      console.error('❌ Course sync failed:', error)
      throw error
    }
  }

  // Canvas course sync
  private async syncCanvasCourses(connection: LMSConnection): Promise<LMSCourse[]> {
    const response = await fetch(`${connection.baseUrl}/api/v1/courses?enrollment_state=active`, {
      headers: {
        'Authorization': `Bearer ${connection.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Canvas courses')
    }

    const canvasCourses = await response.json()
    
    return canvasCourses.map((course: any) => ({
      id: this.generateId(),
      lmsId: course.id.toString(),
      name: course.name,
      code: course.course_code || course.name,
      description: course.description,
      startDate: new Date(course.start_at || course.created_at),
      endDate: new Date(course.end_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
      credits: course.credits || 3,
      instructor: course.teachers?.[0]?.display_name || 'Unknown',
      status: course.workflow_state === 'available' ? 'active' : 'upcoming',
      assignments: [],
      announcements: []
    }))
  }

  // Blackboard course sync
  private async syncBlackboardCourses(connection: LMSConnection): Promise<LMSCourse[]> {
    const response = await fetch(`${connection.baseUrl}/learn/api/public/v1/courses`, {
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Blackboard courses')
    }

    const blackboardCourses = await response.json()
    
    return blackboardCourses.results.map((course: any) => ({
      id: this.generateId(),
      lmsId: course.id,
      name: course.name,
      code: course.courseId,
      description: course.description,
      startDate: new Date(course.created),
      endDate: new Date(course.created),
      credits: 3,
      instructor: 'Unknown',
      status: 'active',
      assignments: [],
      announcements: []
    }))
  }

  // Moodle course sync
  private async syncMoodleCourses(connection: LMSConnection): Promise<LMSCourse[]> {
    const response = await fetch(`${connection.baseUrl}/webservice/rest/server.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        wstoken: connection.apiKey!,
        wsfunction: 'core_course_get_enrolled_courses_by_timeline_classification',
        moodlewsrestformat: 'json'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Moodle courses')
    }

    const moodleData = await response.json()
    const courses = moodleData.courses || []
    
    return courses.map((course: any) => ({
      id: this.generateId(),
      lmsId: course.id.toString(),
      name: course.fullname,
      code: course.shortname,
      description: course.summary,
      startDate: new Date(course.startdate * 1000),
      endDate: new Date(course.enddate * 1000),
      credits: 3,
      instructor: 'Unknown',
      status: 'active',
      assignments: [],
      announcements: []
    }))
  }

  // Sync assignments
  async syncAssignments(connectionId: string, courseId: string): Promise<LMSAssignment[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('LMS connection not found')
    }

    try {
      console.log(`🔄 Syncing assignments for course ${courseId}...`)
      
      let assignments: LMSAssignment[] = []

      switch (connection.lmsType) {
        case 'canvas':
          assignments = await this.syncCanvasAssignments(connection, courseId)
          break
        case 'blackboard':
          assignments = await this.syncBlackboardAssignments(connection, courseId)
          break
        case 'moodle':
          assignments = await this.syncMoodleAssignments(connection, courseId)
          break
      }

      console.log(`✅ Synced ${assignments.length} assignments`)
      return assignments
    } catch (error) {
      console.error('❌ Assignment sync failed:', error)
      throw error
    }
  }

  // Canvas assignment sync
  private async syncCanvasAssignments(connection: LMSConnection, courseId: string): Promise<LMSAssignment[]> {
    const response = await fetch(`${connection.baseUrl}/api/v1/courses/${courseId}/assignments`, {
      headers: {
        'Authorization': `Bearer ${connection.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Canvas assignments')
    }

    const assignments = await response.json()
    
    return assignments.map((assignment: any) => ({
      id: this.generateId(),
      courseId,
      title: assignment.name,
      description: assignment.description,
      dueDate: new Date(assignment.due_at || assignment.created_at),
      points: assignment.points_possible || 100,
      status: 'not-started',
      submissionUrl: assignment.html_url
    }))
  }

  // Blackboard assignment sync
  private async syncBlackboardAssignments(connection: LMSConnection, courseId: string): Promise<LMSAssignment[]> {
    const response = await fetch(`${connection.baseUrl}/learn/api/public/v1/courses/${courseId}/gradebook/columns`, {
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Blackboard assignments')
    }

    const assignments = await response.json()
    
    return assignments.results.map((assignment: any) => ({
      id: this.generateId(),
      courseId,
      title: assignment.name,
      description: assignment.description,
      dueDate: new Date(assignment.created),
      points: assignment.score?.possible || 100,
      status: 'not-started'
    }))
  }

  // Moodle assignment sync
  private async syncMoodleAssignments(connection: LMSConnection, courseId: string): Promise<LMSAssignment[]> {
    const response = await fetch(`${connection.baseUrl}/webservice/rest/server.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        wstoken: connection.apiKey!,
        wsfunction: 'mod_assign_get_assignments',
        moodlewsrestformat: 'json',
        courseids: JSON.stringify([parseInt(courseId)])
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Moodle assignments')
    }

    const data = await response.json()
    const assignments = data.courses?.[0]?.assignments || []
    
    return assignments.map((assignment: any) => ({
      id: this.generateId(),
      courseId,
      title: assignment.name,
      description: assignment.intro,
      dueDate: new Date(assignment.duedate * 1000),
      points: assignment.grade || 100,
      status: 'not-started'
    }))
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

  // Disconnect LMS
  async disconnectLMS(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('LMS connection not found')
    }

    connection.isActive = false
    this.connections.set(connectionId, connection)
    console.log(`🔌 Disconnected from ${connection.lmsType} LMS`)
  }

  // Get all connections
  getConnections(userId: string): LMSConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId)
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Auto-sync functionality
  async startAutoSync(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection || !connection.syncSettings.autoSync) {
      return
    }

    const syncInterval = this.getSyncInterval(connection.syncSettings.syncFrequency)
    
    setInterval(async () => {
      try {
        await this.syncCourses(connectionId)
        console.log(`🔄 Auto-sync completed for ${connection.lmsType}`)
      } catch (error) {
        console.error(`❌ Auto-sync failed for ${connection.lmsType}:`, error)
      }
    }, syncInterval)
  }

  private getSyncInterval(frequency: string): number {
    switch (frequency) {
      case 'realtime': return 5 * 60 * 1000 // 5 minutes
      case 'hourly': return 60 * 60 * 1000 // 1 hour
      case 'daily': return 24 * 60 * 60 * 1000 // 24 hours
      case 'weekly': return 7 * 24 * 60 * 60 * 1000 // 7 days
      default: return 24 * 60 * 60 * 1000 // Default to daily
    }
  }
}

export default LMSIntegrationService
