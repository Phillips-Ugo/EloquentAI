'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import {
  BookOpen,
  Briefcase,
  Award,
  Settings,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Clock,
  DollarSign,
  Star,
  Zap,
  Brain,
  Globe,
  Shield,
  Download,
  Upload,
  Link,
  Unlink
} from 'lucide-react'

interface IntegrationStatus {
  lms: {
    connected: boolean
    connections: number
    lastSync: Date | null
  }
  jobBoards: {
    connected: boolean
    connections: number
    lastSync: Date | null
  }
  certifications: {
    total: number
    active: number
    expiring: number
  }
}

const IntegrationHub: React.FC = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'lms' | 'jobs' | 'certifications' | 'overview'>('overview')
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    lms: { connected: false, connections: 0, lastSync: null },
    jobBoards: { connected: false, connections: 0, lastSync: null },
    certifications: { total: 0, active: 0, expiring: 0 }
  })
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading integration status
    setLoading(true)
    setTimeout(() => {
      setIntegrationStatus({
        lms: { connected: true, connections: 2, lastSync: new Date() },
        jobBoards: { connected: true, connections: 3, lastSync: new Date() },
        certifications: { total: 5, active: 4, expiring: 1 }
      })
      setLoading(false)
    }, 1000)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'lms', label: 'LMS', icon: BookOpen },
    { id: 'jobs', label: 'Job Boards', icon: Briefcase },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LMS Status */}
        <div className="card-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-theme-primary">LMS Integration</h3>
                <p className="text-sm text-theme-secondary">Learning Management Systems</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${integrationStatus.lms.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Connections:</span>
              <span className="text-theme-primary font-medium">{integrationStatus.lms.connections}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Last Sync:</span>
              <span className="text-theme-primary font-medium">
                {integrationStatus.lms.lastSync ? '2 hours ago' : 'Never'}
              </span>
            </div>
          </div>
          
          <button className="w-full mt-4 btn-primary text-sm">
            <Link className="w-4 h-4 mr-2" />
            Manage LMS
          </button>
        </div>

        {/* Job Boards Status */}
        <div className="card-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-theme-primary">Job Boards</h3>
                <p className="text-sm text-theme-secondary">Career Opportunities</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${integrationStatus.jobBoards.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Connections:</span>
              <span className="text-theme-primary font-medium">{integrationStatus.jobBoards.connections}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Last Sync:</span>
              <span className="text-theme-primary font-medium">
                {integrationStatus.jobBoards.lastSync ? '1 hour ago' : 'Never'}
              </span>
            </div>
          </div>
          
          <button className="w-full mt-4 btn-primary text-sm">
            <Link className="w-4 h-4 mr-2" />
            Manage Job Boards
          </button>
        </div>

        {/* Certifications Status */}
        <div className="card-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-theme-primary">Certifications</h3>
                <p className="text-sm text-theme-secondary">Professional Credentials</p>
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Total:</span>
              <span className="text-theme-primary font-medium">{integrationStatus.certifications.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Active:</span>
              <span className="text-theme-primary font-medium">{integrationStatus.certifications.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-theme-secondary">Expiring:</span>
              <span className="text-theme-primary font-medium">{integrationStatus.certifications.expiring}</span>
            </div>
          </div>
          
          <button className="w-full mt-4 btn-primary text-sm">
            <Award className="w-4 h-4 mr-2" />
            Manage Certifications
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-theme p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-theme-secondary/20 rounded-lg">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-theme-primary">Canvas LMS synced successfully</p>
              <p className="text-xs text-theme-secondary">2 new courses, 5 assignments updated</p>
            </div>
            <span className="text-xs text-theme-secondary">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-theme-secondary/20 rounded-lg">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-theme-primary">LinkedIn job search completed</p>
              <p className="text-xs text-theme-secondary">12 new job matches found</p>
            </div>
            <span className="text-xs text-theme-secondary">1 hour ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-theme-secondary/20 rounded-lg">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-theme-primary">AWS Certification goal created</p>
              <p className="text-xs text-theme-secondary">Target date: March 15, 2024</p>
            </div>
            <span className="text-xs text-theme-secondary">3 hours ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-theme p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-theme-secondary/20 rounded-lg hover:bg-theme-secondary/30 transition-colors">
            <Plus className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-theme-primary">Add LMS</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-theme-secondary/20 rounded-lg hover:bg-theme-secondary/30 transition-colors">
            <Search className="w-6 h-6 text-green-500" />
            <span className="text-sm text-theme-primary">Search Jobs</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-theme-secondary/20 rounded-lg hover:bg-theme-secondary/30 transition-colors">
            <Award className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-theme-primary">Add Certification</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-theme-secondary/20 rounded-lg hover:bg-theme-secondary/30 transition-colors">
            <RefreshCw className="w-6 h-6 text-orange-500" />
            <span className="text-sm text-theme-primary">Sync All</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderLMS = () => (
    <div className="space-y-6">
      {/* LMS Connections */}
      <div className="card-theme p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-primary">LMS Connections</h3>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add LMS
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Canvas Connection */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">Canvas LMS</h4>
                <p className="text-sm text-theme-secondary">Georgia Tech</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Connected</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Blackboard Connection */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">Blackboard</h4>
                <p className="text-sm text-theme-secondary">University of Georgia</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Connected</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="card-theme p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">Sync Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-theme-primary">Auto Sync</h4>
              <p className="text-sm text-theme-secondary">Automatically sync data from LMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-theme-primary">Sync Frequency</h4>
              <p className="text-sm text-theme-secondary">How often to sync data</p>
            </div>
            <select className="input-field">
              <option>Daily</option>
              <option>Hourly</option>
              <option>Real-time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderJobBoards = () => (
    <div className="space-y-6">
      {/* Job Board Connections */}
      <div className="card-theme p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-primary">Job Board Connections</h3>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Job Board
          </button>
        </div>
        
        <div className="space-y-4">
          {/* LinkedIn */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">LinkedIn</h4>
                <p className="text-sm text-theme-secondary">Professional Network</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Connected</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Indeed */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">Indeed</h4>
                <p className="text-sm text-theme-secondary">Job Search Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Connected</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Glassdoor */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">Glassdoor</h4>
                <p className="text-sm text-theme-secondary">Company Reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Connected</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Search Settings */}
      <div className="card-theme p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">Job Search Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">Target Keywords</label>
            <input
              type="text"
              placeholder="e.g., Software Engineer, Data Scientist"
              className="input-field"
              defaultValue="Software Engineer, React Developer, Full Stack"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">Target Locations</label>
            <input
              type="text"
              placeholder="e.g., Remote, San Francisco, New York"
              className="input-field"
              defaultValue="Remote, Atlanta, GA"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Min Salary</label>
              <input
                type="number"
                placeholder="50000"
                className="input-field"
                defaultValue="80000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Max Salary</label>
              <input
                type="number"
                placeholder="150000"
                className="input-field"
                defaultValue="120000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCertifications = () => (
    <div className="space-y-6">
      {/* Current Certifications */}
      <div className="card-theme p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-primary">Current Certifications</h3>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </button>
        </div>
        
        <div className="space-y-4">
          {/* AWS Certification */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">AWS Certified Solutions Architect</h4>
                <p className="text-sm text-theme-secondary">Amazon Web Services</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Active</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Azure Certification */}
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">Microsoft Azure Fundamentals</h4>
                <p className="text-sm text-theme-secondary">Microsoft</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-theme-secondary">Active</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Expiring Certification */}
          <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">CompTIA Security+</h4>
                <p className="text-sm text-theme-secondary">CompTIA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-600">Expires in 30 days</span>
              <button className="text-theme-secondary hover:text-theme-primary">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Certification Goals */}
      <div className="card-theme p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">Certification Goals</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium text-theme-primary">Google Cloud Professional Data Engineer</h4>
                <p className="text-sm text-theme-secondary">Target: March 15, 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-theme-border rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
              <span className="text-sm text-theme-secondary">45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading integration status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Integration Hub</h1>
          <p className="text-theme-secondary">Connect and manage your learning ecosystem</p>
        </div>
        <button className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync All
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-theme-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'lms' && renderLMS()}
        {activeTab === 'jobs' && renderJobBoards()}
        {activeTab === 'certifications' && renderCertifications()}
      </div>
    </div>
  )
}

export default IntegrationHub
