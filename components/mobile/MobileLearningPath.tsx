'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import MobileStudyMode from './MobileStudyMode'
import {
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Award,
  Users,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Star,
  Zap,
  Brain,
  Timer
} from 'lucide-react'

interface LearningGoal {
  id: string
  title: string
  description: string
  category: 'academic' | 'career' | 'skill' | 'certification'
  priority: 'low' | 'medium' | 'high' | 'critical'
  targetDate: Date
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'overdue'
  estimatedHours: number
  progress: number
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  timeSpent: number
  milestones: Milestone[]
}

interface Milestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'achieved' | 'overdue'
  points: number
  badge?: string
}

interface LearningPath {
  id: string
  name: string
  description: string
  totalDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  goals: LearningGoal[]
  milestones: Milestone[]
}

const MobileLearningPath: React.FC = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null)
  const [showStudyMode, setShowStudyMode] = useState(false)
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockPath: LearningPath = {
      id: 'path-1',
      name: 'Full-Stack Development Path',
      description: 'Complete learning path to become a full-stack developer',
      totalDuration: 16,
      difficulty: 'intermediate',
      progress: 35,
      goals: [
        {
          id: 'goal-1',
          title: 'Master HTML & CSS',
          description: 'Learn modern HTML5 and CSS3 with responsive design',
          category: 'skill',
          priority: 'high',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'in-progress',
          estimatedHours: 40,
          progress: 60,
          tags: ['web-development', 'frontend'],
          difficulty: 'beginner',
          timeSpent: 24,
          milestones: [
            {
              id: 'milestone-1',
              title: 'HTML Basics Complete',
              description: 'Completed HTML fundamentals',
              status: 'achieved',
              points: 50,
              badge: 'HTML Master'
            },
            {
              id: 'milestone-2',
              title: 'CSS Grid & Flexbox',
              description: 'Master modern CSS layout',
              status: 'in-progress',
              points: 75
            }
          ]
        },
        {
          id: 'goal-2',
          title: 'JavaScript Deep Dive',
          description: 'Master JavaScript ES6+, async programming, and DOM manipulation',
          category: 'skill',
          priority: 'high',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'not-started',
          estimatedHours: 60,
          progress: 0,
          tags: ['javascript', 'programming'],
          difficulty: 'intermediate',
          timeSpent: 0,
          milestones: []
        }
      ],
      milestones: [
        {
          id: 'path-milestone-1',
          title: 'Frontend Foundation',
          description: 'Complete all frontend fundamentals',
          status: 'in-progress',
          points: 200,
          badge: 'Frontend Developer'
        }
      ]
    }

    setCurrentPath(mockPath)
    setLoading(false)
  }, [])

  const startStudySession = (goal: LearningGoal) => {
    setSelectedGoal(goal)
    setShowStudyMode(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'in-progress': return 'text-blue-500'
      case 'paused': return 'text-yellow-500'
      case 'overdue': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'overdue': return <Clock className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading your learning path...</p>
        </div>
      </div>
    )
  }

  if (showStudyMode && selectedGoal) {
    return (
      <MobileStudyMode
        goal={selectedGoal}
        onComplete={() => {
          setShowStudyMode(false)
          setSelectedGoal(null)
        }}
        onProgress={(progress) => {
          // Update goal progress
          if (currentPath) {
            const updatedPath = {
              ...currentPath,
              goals: currentPath.goals.map(goal =>
                goal.id === selectedGoal.id
                  ? { ...goal, progress: Math.min(100, goal.progress + progress) }
                  : goal
              )
            }
            setCurrentPath(updatedPath)
          }
        }}
      />
    )
  }

  if (!currentPath) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-6">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-theme-primary mb-2">
            No Learning Path Found
          </h2>
          <p className="text-theme-secondary mb-6">
            Create your first learning path to get started with your goals.
          </p>
          <button className="btn-primary">
            Create Learning Path
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header */}
      <div className="bg-theme-secondary/20 p-6 border-b border-theme-border">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold text-theme-primary">
              {currentPath.name}
            </h1>
            <p className="text-sm text-theme-secondary">
              {currentPath.description}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-theme-primary">
              Overall Progress
            </span>
            <span className="text-sm text-theme-secondary">
              {currentPath.progress}%
            </span>
          </div>
          <div className="w-full bg-theme-border rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentPath.progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-theme-primary">
              {currentPath.goals.length}
            </div>
            <div className="text-xs text-theme-secondary">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-theme-primary">
              {currentPath.goals.filter(g => g.status === 'completed').length}
            </div>
            <div className="text-xs text-theme-secondary">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-theme-primary">
              {currentPath.totalDuration}w
            </div>
            <div className="text-xs text-theme-secondary">Duration</div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-theme-primary mb-4">
          Learning Goals
        </h2>
        
        <div className="space-y-4">
          {currentPath.goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-theme-secondary/20 rounded-lg p-4 border border-theme-border"
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)} text-white`}>
                      {goal.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-theme-accent/20 text-theme-accent`}>
                      {goal.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-theme-primary mb-1">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-theme-secondary">
                    {goal.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getStatusColor(goal.status)}`}>
                    {getStatusIcon(goal.status)}
                    <span className="text-xs font-medium capitalize">
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-theme-secondary">Progress</span>
                  <span className="text-sm font-medium text-theme-primary">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-theme-border rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Goal Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-xs text-theme-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{goal.timeSpent}h / {goal.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{goal.targetDate.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => startStudySession(goal)}
                  className="btn-primary text-xs px-3 py-1"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Study
                </button>
              </div>

              {/* Milestones */}
              {goal.milestones.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedGoal(
                      expandedGoal === goal.id ? null : goal.id
                    )}
                    className="flex items-center gap-2 text-sm text-theme-accent hover:text-theme-accent/80 transition-colors"
                  >
                    {expandedGoal === goal.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>Milestones ({goal.milestones.length})</span>
                  </button>
                  
                  {expandedGoal === goal.id && (
                    <div className="mt-2 space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-2 p-2 bg-theme-secondary/10 rounded"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            milestone.status === 'achieved' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm text-theme-primary">
                            {milestone.title}
                          </span>
                          {milestone.badge && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                              {milestone.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-theme-secondary/90 backdrop-blur-sm border-t border-theme-border">
        <div className="flex items-center justify-around p-4">
          <button className="flex flex-col items-center gap-1 text-theme-primary">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Path</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-theme-accent">
            <Timer className="w-5 h-5" />
            <span className="text-xs">Study</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-theme-secondary">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Progress</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-theme-secondary">
            <Award className="w-5 h-5" />
            <span className="text-xs">Achievements</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileLearningPath
