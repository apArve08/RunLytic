// app/test-dark/page.tsx (TEMPORARY TEST PAGE)
'use client'

import { useEffect, useState } from 'react'

export default function TestDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDark = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dark Mode Test
        </h1>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Current mode: <strong>{isDark ? 'Dark' : 'Light'}</strong>
          </p>
        </div>

        <button
          onClick={toggleDark}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Toggle Dark Mode
        </button>

        <div className="space-y-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
            <p className="text-gray-900 dark:text-white">White background in light mode, gray in dark mode</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 rounded">
            <p className="text-blue-900 dark:text-blue-100">Blue tinted background</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 p-4 rounded">
            <p className="text-green-900 dark:text-green-100">Green tinted background</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 p-4 rounded">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">Debug Info:</h3>
          <pre className="text-xs text-yellow-800 dark:text-yellow-200">
            {JSON.stringify({
              isDark,
              hasClass: typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : null,
              localStorage: typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}