// lib/theme.ts
'use client'

export function getTheme(): string {
  if (typeof window === 'undefined') return 'light'
  
  const stored = localStorage.getItem('theme')
  if (stored && stored !== 'auto') return stored
  
  // Auto mode - check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  return 'light'
}

export function setTheme(theme: string) {
  localStorage.setItem('theme', theme)
  
  const actualTheme = theme === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  
  if (actualTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function initTheme() {
  const theme = getTheme()
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  }
}