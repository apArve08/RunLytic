// components/settings/ThemeToggle.tsx (UPDATED)
'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'auto'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    setTheme(stored || 'light')
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    
    // Remove existing dark class
    html.classList.remove('dark')
    
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else if (newTheme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark')
      }
    }
    
    // Force a repaint
    void html.offsetHeight
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)

    // Optional: Save to database
    fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {})
  }

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Appearance
      </h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Light Mode */}
        <button
          type="button"
          onClick={() => handleThemeChange('light')}
          className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            theme === 'light'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          <div className={`p-2 rounded-full transition-colors ${
            theme === 'light' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Sun className={`w-6 h-6 transition-colors ${
              theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
          <span className={`text-sm font-medium transition-colors ${
            theme === 'light' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Light
          </span>
        </button>

        {/* Dark Mode */}
        <button
          type="button"
          onClick={() => handleThemeChange('dark')}
          className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            theme === 'dark'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          <div className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Moon className={`w-6 h-6 transition-colors ${
              theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
          <span className={`text-sm font-medium transition-colors ${
            theme === 'dark' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Dark
          </span>
        </button>

        {/* Auto Mode */}
        <button
          type="button"
          onClick={() => handleThemeChange('auto')}
          className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            theme === 'auto'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          <div className={`p-2 rounded-full transition-colors ${
            theme === 'auto' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Monitor className={`w-6 h-6 transition-colors ${
              theme === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
          <span className={`text-sm font-medium transition-colors ${
            theme === 'auto' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Auto
          </span>
        </button>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {theme === 'auto' 
            ? '✨ Following your system preference'
            : theme === 'dark'
            ? '🌙 Dark mode enabled'
            : '☀️ Light mode enabled'}
        </p>
      </div>
    </div>
  )
}