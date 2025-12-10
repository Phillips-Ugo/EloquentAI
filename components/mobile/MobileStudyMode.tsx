'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff,
  Battery,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface MobileStudyModeProps {
  goal: {
    id: string
    title: string
    description: string
    estimatedHours: number
    progress: number
  }
  onComplete?: () => void
  onProgress?: (progress: number) => void
}

interface StudySession {
  id: string
  startTime: Date
  endTime?: Date
  duration: number
  progress: number
  isActive: boolean
}

const MobileStudyMode: React.FC<MobileStudyModeProps> = ({
  goal,
  onComplete,
  onProgress
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [session, setSession] = useState<StudySession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [breakTime, setBreakTime] = useState(5 * 60) // 5 minutes break
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(100)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check online status and battery level
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const checkBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setBatteryLevel(Math.round(battery.level * 100))
        } catch (error) {
          console.log('Battery API not supported')
        }
      }
    }

    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkBatteryLevel()

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining])

  const handleTimerComplete = () => {
    setIsRunning(false)
    
    if (!isBreak) {
      // Study session completed, start break
      setIsBreak(true)
      setTimeRemaining(breakTime)
      playNotificationSound()
      showNotification('Study session completed! Time for a break.')
    } else {
      // Break completed, start new study session
      setIsBreak(false)
      setTimeRemaining(25 * 60)
      playNotificationSound()
      showNotification('Break time over! Ready for another study session?')
    }
  }

  const startSession = () => {
    if (!session) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        startTime: new Date(),
        duration: 0,
        progress: 0,
        isActive: true
      }
      setSession(newSession)
    }
    setIsRunning(true)
  }

  const pauseSession = () => {
    setIsRunning(false)
  }

  const resetSession = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeRemaining(25 * 60)
    setSession(null)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const playNotificationSound = () => {
    if (!isMuted) {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Study Session', {
        body: message,
        icon: '/icons/icon-192x192.png'
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const totalTime = isBreak ? breakTime : 25 * 60
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-500'
    if (batteryLevel > 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className={`min-h-screen bg-theme-primary ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-theme-secondary/50">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-xs text-theme-secondary">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Battery className={`w-4 h-4 ${getBatteryColor()}`} />
          <span className={`text-xs ${getBatteryColor()}`}>
            {batteryLevel}%
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
        {/* Goal Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-theme-primary mb-2">
            {goal.title}
          </h1>
          <p className="text-theme-secondary text-sm">
            {goal.description}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-theme-secondary">
                {goal.progress}% Complete
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-sm text-theme-secondary">
                {goal.estimatedHours}h Estimated
              </span>
            </div>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="relative mb-8">
          <div className="w-64 h-64 rounded-full border-8 border-theme-border flex items-center justify-center">
            <div className="w-56 h-56 rounded-full bg-theme-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-theme-primary mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-theme-secondary">
                  {isBreak ? 'Break Time' : 'Study Time'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-64 h-64 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-theme-border"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
              className={`transition-all duration-1000 ${isBreak ? 'text-yellow-500' : 'text-blue-500'}`}
            />
          </svg>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={isRunning ? pauseSession : startSession}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white transition-colors`}
          >
            {isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
          
          <button
            onClick={resetSession}
            className="w-12 h-12 rounded-full bg-theme-secondary hover:bg-theme-secondary/80 flex items-center justify-center text-theme-primary transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Session Stats */}
        {session && (
          <div className="bg-theme-secondary/20 rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-sm font-medium text-theme-primary mb-2">
              Session Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-theme-secondary">
                <span>Started:</span>
                <span>{session.startTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-xs text-theme-secondary">
                <span>Duration:</span>
                <span>{formatTime(session.duration)}</span>
              </div>
              <div className="flex justify-between text-xs text-theme-secondary">
                <span>Progress:</span>
                <span>{session.progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-theme-secondary/90 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2 text-theme-primary hover:text-theme-accent transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span className="text-sm">Sound</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-theme-primary hover:text-theme-accent transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
            <span className="text-sm">Fullscreen</span>
          </button>
          
          <button className="flex items-center gap-2 text-theme-primary hover:text-theme-accent transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              You're offline. Study session will sync when connection is restored.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileStudyMode
