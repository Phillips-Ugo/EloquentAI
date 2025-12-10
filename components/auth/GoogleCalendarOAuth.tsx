'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Calendar, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'

interface GoogleCalendarOAuthProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

interface OAuthStatus {
  isConnected: boolean
  isAuthenticated: boolean
  tokenValid: boolean
  userEmail?: string
  calendarName?: string
}

const GoogleCalendarOAuth: React.FC<GoogleCalendarOAuthProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [status, setStatus] = useState<OAuthStatus>({
    isConnected: false,
    isAuthenticated: false,
    tokenValid: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check OAuth status on component mount
  useEffect(() => {
    checkOAuthStatus()
  }, [])

  const checkOAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/google-calendar/status')
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setError(null)
      } else {
        throw new Error('Failed to check OAuth status')
      }
    } catch (err) {
      console.error('Error checking OAuth status:', err)
      setError('Failed to check connection status')
    } finally {
      setLoading(false)
    }
  }

  const initiateOAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Redirect to OAuth flow
      const response = await fetch('/api/google-calendar/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          redirectUri: window.location.origin + '/dashboard'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = data.authUrl
        } else {
          throw new Error('No auth URL received')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to initiate OAuth')
      }
    } catch (err) {
      console.error('OAuth initiation error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Google Calendar'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (response.ok) {
        setStatus({
          isConnected: false,
          isAuthenticated: false,
          tokenValid: false
        })
        onSuccess?.()
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (err) {
      console.error('Disconnect error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/google-calendar/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (response.ok) {
        await checkOAuthStatus()
        onSuccess?.()
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (err) {
      console.error('Token refresh error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh token'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="w-5 h-5 animate-spin" />
    }
    
    if (status.isConnected && status.isAuthenticated && status.tokenValid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    
    if (status.isConnected && !status.tokenValid) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
    
    return <AlertTriangle className="w-5 h-5 text-red-500" />
  }

  const getStatusText = () => {
    if (loading) {
      return 'Checking connection...'
    }
    
    if (status.isConnected && status.isAuthenticated && status.tokenValid) {
      return `Connected as ${status.userEmail || 'Google User'}`
    }
    
    if (status.isConnected && !status.tokenValid) {
      return 'Token expired - needs refresh'
    }
    
    return 'Not connected to Google Calendar'
  }

  const getStatusColor = () => {
    if (status.isConnected && status.isAuthenticated && status.tokenValid) {
      return 'text-green-600'
    }
    
    if (status.isConnected && !status.tokenValid) {
      return 'text-yellow-600'
    }
    
    return 'text-red-600'
  }

  return (
    <div className={`card-theme p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-theme-primary">
          Google Calendar Integration
        </h3>
      </div>

      {/* Status Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {status.calendarName && (
          <p className="text-sm text-theme-secondary">
            Calendar: {status.calendarName}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!status.isConnected ? (
          <button
            onClick={initiateOAuth}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Connect Google Calendar
          </button>
        ) : (
          <>
            {!status.tokenValid && (
              <button
                onClick={refreshToken}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Refresh Connection
              </button>
            )}
            
            <button
              onClick={disconnect}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              Disconnect
            </button>
          </>
        )}
        
        <button
          onClick={checkOAuthStatus}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Check Status
        </button>
      </div>

      {/* Features List */}
      <div className="mt-6 pt-4 border-t border-theme-border">
        <h4 className="text-sm font-medium text-theme-primary mb-2">
          What you can do with Google Calendar:
        </h4>
        <ul className="text-sm text-theme-secondary space-y-1">
          <li>• Sync study sessions automatically</li>
          <li>• Get reminders for learning goals</li>
          <li>• Block time for focused study</li>
          <li>• Track learning progress in calendar</li>
          <li>• Share study schedules with study groups</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Privacy & Security</p>
            <p>
              We only access your calendar to create and manage study events. 
              We never read your personal events or share your data with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleCalendarOAuth
