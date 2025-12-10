'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface PWAInstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const { theme } = useTheme()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed' | 'error'>('idle')

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInApp)
    }

    // Check online status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setInstallStatus('installed')
      setIsInstalled(true)
      setShowPrompt(false)
      onInstall?.()
    }

    // Check initial status
    checkInstallStatus()
    checkOnlineStatus()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [onInstall])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      setInstallStatus('installing')
      
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setInstallStatus('installed')
        setIsInstalled(true)
        setShowPrompt(false)
        onInstall?.()
      } else {
        console.log('User dismissed the install prompt')
        setInstallStatus('idle')
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during installation:', error)
      setInstallStatus('error')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    onDismiss?.()
  }

  const handleManualInstall = () => {
    // Show manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    
    if (isIOS) {
      alert('To install this app on iOS:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"')
    } else if (isAndroid) {
      alert('To install this app on Android:\n1. Tap the menu button (three dots)\n2. Tap "Add to Home Screen"\n3. Tap "Add"')
    } else {
      alert('To install this app:\n1. Look for the install icon in your browser\'s address bar\n2. Click it and follow the prompts')
    }
  }

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">App Installed!</span>
        </div>
        <p className="text-xs mt-1 opacity-90">
          SmartCourseAI is now installed on your device
        </p>
      </div>
    )
  }

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-secondary rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-theme-primary">
              Install SmartCourseAI
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="font-semibold text-theme-primary mb-2">
              Get the Full Experience
            </h4>
            <p className="text-sm text-theme-secondary">
              Install SmartCourseAI for a better learning experience with offline access and faster loading.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-theme-secondary">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Offline study sessions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-theme-secondary">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Faster loading times</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-theme-secondary">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-theme-secondary">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Home screen access</span>
            </div>
          </div>

          {/* Online Status */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-theme-primary/10 rounded">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-theme-secondary">
              {isOnline ? 'Online - Full features available' : 'Offline - Limited features'}
            </span>
          </div>

          {/* Install Status */}
          {installStatus === 'installing' && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-blue-500/10 rounded">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-xs text-blue-600">Installing...</span>
            </div>
          )}

          {installStatus === 'error' && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-red-500/10 rounded">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">Installation failed</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              disabled={installStatus === 'installing'}
              className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
            >
              {installStatus === 'installing' ? 'Installing...' : 'Install App'}
            </button>
            <button
              onClick={handleManualInstall}
              className="btn-secondary text-sm py-2 px-3"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-theme-secondary hover:text-theme-primary transition-colors mt-2"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
