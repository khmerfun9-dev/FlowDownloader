import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudArrowDownIcon, 
  LinkIcon, 
  PlayIcon,
  ShareIcon,
  FolderOpenIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Download, Instagram, Facebook, Music, User, Key, CreditCard, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginModal from './components/Auth/LoginModal'
import LicenseModal from './components/Auth/LicenseModal'
import PaymentModal from './components/Payment/PaymentModal'
import { useAnalytics } from './hooks/useAnalytics'
import ConsentBanner from './components/ConsentBanner'

function AppContent() {
  const { user, userLicense, logout, updateLicense, checkDownloadPermission } = useAuth()
  const { trackEvent, trackPageView } = useAnalytics()
  const [url, setUrl] = useState('')
  const [detectedPlatform, setDetectedPlatform] = useState(null)
  const [videoInfo, setVideoInfo] = useState(null)
  const [quality, setQuality] = useState('1080p')
  const [format, setFormat] = useState('mp4')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [batchUrls, setBatchUrls] = useState([''])
  const [showBatch, setShowBatch] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Platform detection
  useEffect(() => {
    if (url) {
      if (url.includes('facebook.com') || url.includes('fb.watch')) {
        setDetectedPlatform('facebook')
        setVideoInfo({
          title: 'Sample Facebook Video',
          thumbnail: 'https://via.placeholder.com/320x180?text=Facebook+Video',
          duration: '2:34'
        })
      } else if (url.includes('instagram.com')) {
        setDetectedPlatform('instagram')
        setVideoInfo({
          title: 'Sample Instagram Reel',
          thumbnail: 'https://via.placeholder.com/320x180?text=Instagram+Reel',
          duration: '0:45'
        })
      } else if (url.includes('tiktok.com')) {
        setDetectedPlatform('tiktok')
        setVideoInfo({
          title: 'Sample TikTok Video',
          thumbnail: 'https://via.placeholder.com/320x180?text=TikTok+Video',
          duration: '1:12'
        })
      } else {
        setDetectedPlatform(null)
        setVideoInfo(null)
      }
    } else {
      setDetectedPlatform(null)
      setVideoInfo(null)
    }
  }, [url])

  // Enhanced dark mode effect with smooth transitions
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    const root = document.documentElement
    
    // Add transition class for smooth theme switching
    root.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    
    if (darkMode) {
      root.classList.add('dark')
      document.body.classList.add('dark')
      document.body.style.backgroundColor = 'var(--bg-primary)'
      document.body.style.color = 'var(--text-primary)'
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
      document.body.style.backgroundColor = 'var(--bg-primary)'
      document.body.style.color = 'var(--text-primary)'
    }
    
    // Clean up transition after animation
    setTimeout(() => {
      root.style.transition = ''
    }, 300)
  }, [darkMode])

  // Clipboard detection
  useEffect(() => {
    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text && (text.includes('facebook.com') || text.includes('instagram.com') || text.includes('tiktok.com'))) {
          setUrl(text)
        }
      } catch (err) {
        console.log('Clipboard access denied')
      }
    }

    window.addEventListener('focus', handlePaste)
    return () => window.removeEventListener('focus', handlePaste)
  }, [])

  const handleDownload = async () => {
    if (!url.trim()) {
      alert('Please enter a valid URL')
      return
    }

    setIsDownloading(true)
    setDownloadProgress(0)
    
    // Track download start event
    trackEvent('download_start', {
      url: url,
      format: format,
      quality: quality,
      platform: detectedPlatform || 'unknown',
      user_type: user ? 'authenticated' : 'anonymous',
      license_type: userLicense?.type || 'free'
    })
    
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:3001/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify({
          url: url.trim(),
          format: format,
          quality: quality
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Download failed')
      }

      if (data.success && data.jobId) {
        // Start polling for progress
        const jobId = data.jobId
        let progressInterval = setInterval(async () => {
          try {
            const progressResponse = await fetch(`http://localhost:3001/api/download/progress/${jobId}`)
            const progressData = await progressResponse.json()
            
            if (progressData.success) {
              const progress = progressData.progress || 0
              setDownloadProgress(progress)
              
              if (progressData.status === 'completed') {
                clearInterval(progressInterval)
                setIsDownloading(false)
                setIsCompleted(true)
                
                // Track download completion event
                trackEvent('download_complete', {
                  url: url,
                  format: format,
                  quality: quality,
                  platform: detectedPlatform || 'unknown',
                  user_type: user ? 'authenticated' : 'anonymous',
                  license_type: userLicense?.type || 'free',
                  file_size: progressData.fileSize || 'Unknown'
                })
                
                // Trigger file download
                if (progressData.downloadUrl) {
                  const link = document.createElement('a')
                  link.href = progressData.downloadUrl
                  link.download = progressData.filename || 'download'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }
              } else if (progressData.status === 'failed') {
                clearInterval(progressInterval)
                throw new Error(progressData.error || 'Download failed')
              }
            }
          } catch (error) {
            console.error('Progress check error:', error)
          }
        }, 1000)
        
        // Timeout after 5 minutes
        setTimeout(() => {
          if (progressInterval) {
            clearInterval(progressInterval)
            setIsDownloading(false)
            alert('Download timeout. Please try again.')
          }
        }, 300000)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Download error:', error)
      setIsDownloading(false)
      setDownloadProgress(0)
      alert(`Download failed: ${error.message}`)
      
      // Track download error event
      trackEvent('download_error', {
        url: url,
        format: format,
        quality: quality,
        error: error.message,
        platform: detectedPlatform || 'unknown',
        user_type: user ? 'authenticated' : 'anonymous',
        license_type: userLicense?.type || 'free'
      })
    }
  }

  const addBatchUrl = () => {
    setBatchUrls([...batchUrls, ''])
  }

  const updateBatchUrl = (index, value) => {
    const newUrls = [...batchUrls]
    newUrls[index] = value
    setBatchUrls(newUrls)
  }

  const removeBatchUrl = (index) => {
    setBatchUrls(batchUrls.filter((_, i) => i !== index))
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />
      case 'instagram': return <Instagram className="w-5 h-5" />
      case 'tiktok': return <Music className="w-5 h-5" />
      default: return <LinkIcon className="w-5 h-5" />
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook': return 'text-blue-500'
      case 'instagram': return 'text-pink-500'
      case 'tiktok': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Enhanced Background with Responsive Animated Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Dynamic Gradient Background */}
          <motion.div 
            className="absolute inset-0"
            animate={{
              background: darkMode 
                ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #1e1b4b 75%, #0f0f23 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
            }}
            transition={{ duration: 1 }}
          />
          
          {/* Animated Dot Pattern */}
          <motion.div 
            className="absolute inset-0"
            animate={{ opacity: darkMode ? 0.3 : 0.2 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundImage: darkMode 
                ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          {/* Floating Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                darkMode ? 'bg-blue-400/30' : 'bg-white/40'
              }`}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowDownloader</h1>
              <p className="text-sm text-theme-text-secondary">Download videos from any platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Authentication Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* License Status */}
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-2">
                  <Key className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white font-medium">
                    {userLicense?.type || 'Free'}
                  </span>
                  {userLicense?.status === 'active' && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setShowLicenseModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 text-white hover:bg-white/20 transition-all duration-300"
                    title="Manage Licenses"
                  >
                    <Key className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowPaymentModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 text-white hover:bg-white/20 transition-all duration-300"
                    title="Upgrade Plan"
                  >
                    <CreditCard className="w-5 h-5" />
                  </motion.button>
                  
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-2">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white font-medium">{user.name}</span>
                  </div>
                  
                  <motion.button
                    onClick={logout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 text-white hover:bg-red-500/20 transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowLoginModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Sign In
              </motion.button>
            )}
            
            <motion.button
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            className="relative bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl w-14 h-14 p-0 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 shadow-xl overflow-hidden group"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {/* Animated Background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20"
              animate={{ 
                background: darkMode 
                  ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))'
                  : 'linear-gradient(45deg, rgba(251, 191, 36, 0.2), rgba(249, 115, 22, 0.2))'
              }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Icon Container */}
            <motion.div
              animate={{ rotate: darkMode ? 0 : 180 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative z-10"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SunIcon className="w-7 h-7 text-yellow-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MoonIcon className="w-7 h-7 text-blue-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Hover Glow Effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
          </div>
        </motion.header>

        {/* Hero Content */}
        <div className="relative z-10 text-center py-16 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Download Videos
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Instantly
              </span>
            </h2>
            <p className="text-xl text-theme-text-secondary mb-12 max-w-2xl mx-auto">
              Paste any video URL and download in your preferred quality and format. 
              Supports YouTube, Facebook, Instagram, TikTok, and more.
            </p>
          </motion.div>
        </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20 -mt-8 relative z-10">
        {/* Enhanced Large Input Card with Advanced Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-3xl border-2 border-white/30 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
        >
          {/* Glassmorphism Border Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm -z-10" />
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
          <div className="text-center mb-8 relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <LinkIcon className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Paste Your Video Link</h3>
            </div>
            <p className="text-theme-text-secondary text-lg">Support for 1000+ websites including YouTube, Facebook, Instagram, TikTok</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-theme-text-secondary">Ready to download</span>
              </div>
              <motion.button
                onClick={() => setShowBatch(!showBatch)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10">{showBatch ? '📄 Single' : '📋 Batch'} Mode</span>
              </motion.button>
            </div>
            
            {!showBatch ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or any video URL"
                    className="bg-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl px-6 py-5 w-full pr-16 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-lg transition-all duration-200 focus:bg-white/10"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {detectedPlatform && (
                      <div className={`${getPlatformColor(detectedPlatform)} bg-white/10 p-2 rounded-lg`}>
                        {getPlatformIcon(detectedPlatform)}
                      </div>
                    )}
                    <motion.button 
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText()
                          setUrl(text)
                        } catch (err) {
                          console.log('Clipboard access denied')
                        }
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-200 relative overflow-hidden group"
                      title="Paste from clipboard"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <span className="relative z-10">📋</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {batchUrls.map((batchUrl, index) => (
                  <div key={index} className="flex space-x-3 group">
                    <div className="flex-1 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <input
                        type="text"
                        value={batchUrl}
                        onChange={(e) => updateBatchUrl(index, e.target.value)}
                        placeholder={`Video URL ${index + 1}...`}
                        className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-4 w-full text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    {batchUrls.length > 1 && (
                      <motion.button
                        onClick={() => removeBatchUrl(index)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl px-4 py-2 text-red-400 hover:text-red-300 transition-all duration-200 font-bold relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        <span className="relative z-10">✕</span>
                      </motion.button>
                    )}
                  </div>
                ))}
                <motion.button
                  onClick={addBatchUrl}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/30 hover:border-white/50 rounded-xl px-6 py-4 w-full text-white hover:text-blue-300 transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <motion.span 
                    className="text-2xl relative z-10"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    +
                  </motion.span>
                  <span className="relative z-10">Add Another URL</span>
                </motion.button>
              </div>
            )}
            
            {/* Format and Quality Selection */}
            {url && !showBatch && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white uppercase tracking-wide">
                      Video Quality
                    </label>
                    <select 
                      value={quality} 
                      onChange={(e) => setQuality(e.target.value)}
                      className="bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-xl px-4 py-3 w-full text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-all duration-300"
                    >
                      <option value="480p">📱 480p - Standard Quality</option>
                      <option value="720p">💻 720p - HD Quality</option>
                      <option value="1080p">🖥️ 1080p - Full HD</option>
                      <option value="1440p">🖥️ 1440p - 2K Quality</option>
                      <option value="2160p">📺 2160p - 4K Ultra HD</option>
                      <option value="original">⭐ Original Quality</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white uppercase tracking-wide">
                      Format
                    </label>
                    <select 
                      value={format} 
                      onChange={(e) => setFormat(e.target.value)}
                      className="bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-xl px-4 py-3 w-full text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-all duration-300"
                    >
                      <option value="mp4">🎬 MP4 (Video)</option>
                      <option value="mp3">🎵 MP3 (Audio Only)</option>
                      <option value="webm">🌐 WEBM (Web)</option>
                    </select>
                  </div>
                </div>
                
                {/* Download Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleDownload}
                  disabled={isDownloading || !url.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center space-x-3"
                >
                  {isDownloading ? (
                    <>
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : !url.trim() ? (
                    <>
                      <CloudArrowDownIcon className="w-6 h-6 opacity-50" />
                      <span>Enter URL to Download</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowDownIcon className="w-6 h-6" />
                      <span>Download Now</span>
                      <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                        {format.toUpperCase()} • {quality}
                      </div>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Video Preview Card */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden relative group cursor-pointer"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
              {/* Animated Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="text-xl font-bold text-white"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Video Detected
                    </motion.h3>
                    <p className="text-sm text-theme-text-secondary">Ready for download</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Thumbnail */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative">
                      <motion.img 
                        src={videoInfo.thumbnail} 
                        alt="Video thumbnail"
                        className="w-full h-32 md:h-40 object-cover rounded-2xl shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <PlayIcon className="w-12 h-12 text-white" />
                      </motion.div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        {videoInfo.duration}
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={`${getPlatformColor(detectedPlatform)} bg-white/10 p-3 rounded-xl`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getPlatformIcon(detectedPlatform)}
                      </motion.div>
                      <div>
                        <span className="text-sm font-medium text-theme-text-secondary uppercase tracking-wide">{detectedPlatform}</span>
                        <motion.div 
                          className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-1"
                          initial={{ width: 0 }}
                          animate={{ width: 48 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        ></motion.div>
                      </div>
                    </div>
                    
                    <motion.h4 
                      className="text-xl font-bold text-white leading-tight"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {videoInfo.title}
                    </motion.h4>
                    
                    <div className="flex flex-wrap gap-3">
                      <motion.div 
                        className="bg-white/10 px-3 py-2 rounded-xl flex items-center space-x-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="w-2 h-2 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                        <span className="text-sm text-theme-text-secondary">Duration: {videoInfo.duration}</span>
                      </motion.div>
                      <motion.div 
                        className="bg-white/10 px-3 py-2 rounded-xl flex items-center space-x-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="w-2 h-2 bg-blue-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        ></motion.div>
                        <span className="text-sm text-theme-text-secondary">Quality: {quality}</span>
                      </motion.div>
                      <motion.div 
                        className="bg-white/10 px-3 py-2 rounded-xl flex items-center space-x-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        ></motion.div>
                        <span className="text-sm text-theme-text-secondary">Format: {format}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Download Options */}
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <CloudArrowDownIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Download Settings</h3>
                <p className="text-sm text-theme-text-secondary">Choose your preferred quality and format</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <motion.label 
                  className="block text-sm font-semibold text-theme-text-primary uppercase tracking-wide"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Video Quality
                </motion.label>
                <motion.div 
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.select 
                    value={quality} 
                    onChange={(e) => setQuality(e.target.value)}
                    whileFocus={{ scale: 1.02, y: -2 }}
                    className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/30 rounded-2xl px-4 py-4 w-full text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-all duration-300 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                      backdropFilter: 'blur(15px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(15px) saturate(150%)'
                    }}
                  >
                    <option value="480p">📱 480p - Standard Quality (854x480, ~50MB)</option>
                    <option value="720p">💻 720p - HD Quality (1280x720, ~100MB)</option>
                    <option value="1080p">🖥️ 1080p - Full HD (1920x1080, ~200MB)</option>
                    <option value="1440p">🖥️ 1440p - 2K Quality (2560x1440, ~400MB)</option>
                    <option value="2160p">📺 2160p - 4K Ultra HD (3840x2160, ~800MB)</option>
                    <option value="original">⭐ Original Quality (Best Available)</option>
                  </motion.select>
                  <motion.div 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg className="w-5 h-5 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <motion.label 
                  className="block text-sm font-semibold text-theme-text-primary uppercase tracking-wide"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  File Format
                </motion.label>
                <motion.div 
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.select 
                    value={format} 
                    onChange={(e) => setFormat(e.target.value)}
                    whileFocus={{ scale: 1.02, y: -2 }}
                    className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/30 rounded-2xl px-4 py-4 w-full text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-all duration-300 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                      backdropFilter: 'blur(15px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(15px) saturate(150%)'
                    }}
                  >
                    <option value="mp4">🎬 MP4 (Video)</option>
                    <option value="mp3">🎵 MP3 (Audio Only)</option>
                    <option value="webm">🌐 WEBM (Web)</option>
                  </motion.select>
                  <motion.div 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <svg className="w-5 h-5 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Enhanced Download Button */}
            {!isDownloading && !isCompleted && (
              <motion.button 
                onClick={handleDownload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:shadow-2xl flex items-center justify-center space-x-4 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <CloudArrowDownIcon className="w-7 h-7 relative z-10" />
                <span className="relative z-10">Download {format.toUpperCase()}</span>
                <div className="bg-white/20 px-4 py-2 rounded-xl text-sm relative z-10">
                  {quality}
                </div>
              </motion.button>
            )}

            {/* Enhanced Progress Bar with Advanced Animations */}
            {isDownloading && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="space-y-6 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
              >
                {/* Animated Background Particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
                      animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.8, 0.2]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: `${10 + i * 15}%`,
                        top: `${20 + (i % 2) * 40}%`
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.div 
                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="font-bold text-white text-lg"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Downloading your content...
                      </motion.p>
                      <p className="text-sm text-theme-text-secondary">Processing with advanced algorithms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.div 
                      className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {Math.round(downloadProgress)}%
                    </motion.div>
                    <div className="text-xs text-theme-text-muted uppercase tracking-wider">Complete</div>
                  </div>
                </div>
                
                <div className="relative">
                  {/* Progress Bar Background */}
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/10">
                    {/* Animated Progress Fill */}
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden shadow-lg"
                      initial={{ width: 0, x: -100 }}
                      animate={{ 
                        width: `${downloadProgress}%`,
                        x: 0
                      }}
                      transition={{ 
                        width: { duration: 0.8, ease: "easeOut" },
                        x: { duration: 0.5, ease: "easeOut" }
                      }}
                    >
                      {/* Shimmer Effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Pulse Effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                  
                  {/* Progress Markers */}
                  <div className="flex justify-between text-xs text-theme-text-muted mt-3 px-1">
                    <motion.span 
                      animate={{ opacity: downloadProgress > 0 ? 1 : 0.5 }}
                      className="font-medium"
                    >
                      0%
                    </motion.span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Completion Status */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-8 bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto animate-ping opacity-20"></div>
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Download Complete!</h3>
                  <p className="text-theme-text-secondary text-lg">Your file has been successfully downloaded</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-theme-text-muted">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Ready to use</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3"
                  >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span>Open Folder</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => {
                      setIsCompleted(false);
                      setDownloadProgress(0);
                      setUrl('');
                      setVideoInfo(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Download Another</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Enhanced Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Free Forever</h3>
              <p className="text-sm text-theme-text-secondary">No hidden fees, no subscriptions</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CloudArrowDownIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-white mb-1">Unlimited Downloads</div>
                <div className="text-theme-text-muted">Download as many videos as you want</div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-sm">4K</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold text-white mb-1">High Quality</div>
                <div className="text-theme-text-muted">Up to 4K resolution support</div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xs">MP4</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold text-white mb-1">Multiple Formats</div>
                <div className="text-theme-text-muted">MP4, MP3, WEBM and more</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-theme-text-muted mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Trusted by 10,000+ users worldwide</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              ⭐ Rate Us
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              📱 Get App
            </motion.button>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8 border-t border-white/10 mt-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CloudArrowDownIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FlowDownloader
            </span>
          </div>
          <p className="text-theme-text-muted text-sm mb-4">
            The fastest and most reliable video downloader for all platforms
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-theme-text-muted">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="mt-4 text-xs text-theme-text-muted">
            © 2024 FlowDownloader. Made with ❤️ for content creators.
          </div>
        </motion.footer>
      </div>
      
      {/* Authentication Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={(userData) => {
          updateLicense(userData.currentLicense);
          setShowLoginModal(false);
        }}
      />
      
      <LicenseModal 
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        user={user}
        onLicenseUpdate={updateLicense}
      />
      
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
        onPaymentSuccess={(license) => {
          updateLicense(license);
          setShowPaymentModal(false);
        }}
      />
      
      {/* GDPR Consent Banner */}
      <ConsentBanner />
      </div>
    </div>
  )
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
