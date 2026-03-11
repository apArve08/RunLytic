// components/providers/ThemeProvider.tsx
'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply theme on mount
    const applyTheme = () => {
      const theme = localStorage.getItem('theme') || 'light'
      const html = document.documentElement
      
      html.classList.remove('dark', 'light')
      
      if (theme === 'dark') {
        html.classList.add('dark')
      } else if (theme === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          html.classList.add('dark')
        }
      }
    }

    applyTheme()

    // Listen for storage changes (if user changes theme in another tab)
    window.addEventListener('storage', applyTheme)
    
    return () => window.removeEventListener('storage', applyTheme)
  }, [])

  return <>{children}</>
}