// components/settings/ThemeToggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { setTheme } from '@/lib/theme'

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState('light')

  useEffect(() => {
    setCurrentTheme(localStorage.getItem('theme') || 'light')
  }, [])

  const handleThemeChange = (theme: string) => {
    setTheme(theme)
    setCurrentTheme(theme)
    
    // Save to database
    fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Theme
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleThemeChange('light')}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
            currentTheme === 'light'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Sun className={`w-6 h-6 ${
            currentTheme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <span className={`text-sm font-medium ${
            currentTheme === 'light' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Light
          </span>
        </button>

        <button
          onClick={() => handleThemeChange('dark')}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
            currentTheme === 'dark'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Moon className={`w-6 h-6 ${
            currentTheme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <span className={`text-sm font-medium ${
            currentTheme === 'dark' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Dark
          </span>
        </button>

        <button
          onClick={() => handleThemeChange('auto')}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
            currentTheme === 'auto'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Monitor className={`w-6 h-6 ${
            currentTheme === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <span className={`text-sm font-medium ${
            currentTheme === 'auto' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Auto
          </span>
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Choose between light, dark, or auto (follows system preference)
      </p>
    </div>
  )
}