'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Footprints, Calendar, TrendingUp, Settings, LogOut,
  ChevronDown, Trophy, Heart, Cloud, Share2, BarChart3, Award,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return { open, setOpen, ref }
}

const base = 'flex items-center gap-2 transition text-sm font-medium'
const inactive = 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
const active = 'text-blue-600 dark:text-blue-400'

const dropItemBase = 'flex items-center gap-2 px-4 py-2.5 text-sm transition'
const dropItemInactive = 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
const dropItemActive = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'

// ─── component ───────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname()
  const analyticsDropdown = useDropdown()
  const trainingDropdown = useDropdown()
  const settingsDropdown = useDropdown()

  const is = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const anyActive = (hrefs: string[]) => hrefs.some(is)

  const analyticsLinks = ['/progress', '/records', '/zones', '/weather']
  const trainingLinks  = ['/schedule', '/monthly', '/shoes']

  // Close other dropdowns when one opens
  const toggle = (which: 'analytics' | 'training' | 'settings') => {
    if (which !== 'analytics') analyticsDropdown.setOpen(false)
    if (which !== 'training')  trainingDropdown.setOpen(false)
    if (which !== 'settings')  settingsDropdown.setOpen(false)
    if (which === 'analytics') analyticsDropdown.setOpen(v => !v)
    if (which === 'training')  trainingDropdown.setOpen(v => !v)
    if (which === 'settings')  settingsDropdown.setOpen(v => !v)
  }

  return (
    <>
      {/* ── Desktop header ─────────────────────────────────────────────── */}
      <header className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">RunTrack</span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-1">

              {/* Dashboard */}
              <Link
                href="/"
                className={`${base} px-3 py-2 rounded-lg ${is('/') ? `${active} bg-blue-50 dark:bg-blue-900/20` : inactive}`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>

              {/* Runs */}
              <Link
                href="/runs"
                className={`${base} px-3 py-2 rounded-lg ${is('/runs') ? `${active} bg-blue-50 dark:bg-blue-900/20` : inactive}`}
              >
                <Footprints className="w-4 h-4" />
                Runs
              </Link>

              {/* Analytics dropdown */}
              <div className="relative" ref={analyticsDropdown.ref}>
                <button
                  onClick={() => toggle('analytics')}
                  className={`${base} px-3 py-2 rounded-lg ${anyActive(analyticsLinks) ? `${active} bg-blue-50 dark:bg-blue-900/20` : inactive}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${analyticsDropdown.open ? 'rotate-180' : ''}`} />
                </button>
                {analyticsDropdown.open && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {[
                      { href: '/progress', icon: TrendingUp, label: 'Progress Reports' },
                      { href: '/records',  icon: Trophy,     label: 'Personal Records' },
                      { href: '/zones',    icon: Heart,      label: 'Training Zones' },
                      { href: '/weather',  icon: Cloud,      label: 'Weather Analysis' },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => analyticsDropdown.setOpen(false)}
                        className={`${dropItemBase} ${is(href) ? dropItemActive : dropItemInactive}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Training dropdown */}
              <div className="relative" ref={trainingDropdown.ref}>
                <button
                  onClick={() => toggle('training')}
                  className={`${base} px-3 py-2 rounded-lg ${anyActive(trainingLinks) ? `${active} bg-blue-50 dark:bg-blue-900/20` : inactive}`}
                >
                  <Calendar className="w-4 h-4" />
                  Training
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${trainingDropdown.open ? 'rotate-180' : ''}`} />
                </button>
                {trainingDropdown.open && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {[
                      { href: '/schedule', icon: Calendar,  label: 'Schedule' },
                      { href: '/monthly',  icon: Award,     label: 'Monthly Stats' },
                      { href: '/shoes',    icon: Footprints, label: 'Shoes' },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => trainingDropdown.setOpen(false)}
                        className={`${dropItemBase} ${is(href) ? dropItemActive : dropItemInactive}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Share */}
              <Link
                href="/stats-widget"
                className={`${base} px-3 py-2 rounded-lg ${is('/stats-widget') ? `${active} bg-blue-50 dark:bg-blue-900/20` : inactive}`}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Link>

              {/* Settings dropdown */}
              <div className="relative" ref={settingsDropdown.ref}>
                <button
                  onClick={() => toggle('settings')}
                  className={`${base} px-3 py-2 rounded-lg ${is('/settings') ? `${active} bg-blue-50 dark:bg-blue-900/20` : inactive}`}
                >
                  <Settings className="w-4 h-4" />
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsDropdown.open ? 'rotate-180' : ''}`} />
                </button>
                {settingsDropdown.open && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link
                      href="/settings"
                      onClick={() => settingsDropdown.setOpen(false)}
                      className={`${dropItemBase} ${is('/settings') ? dropItemActive : dropItemInactive}`}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile top header ──────────────────────────────────────────── */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">RunTrack</span>
          </Link>
          <Link
            href="/runs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Log Run
          </Link>
        </div>
      </header>

      {/* ── Mobile bottom nav ──────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="grid grid-cols-5">
          {[
            { href: '/',         icon: Home,      label: 'Home' },
            { href: '/runs',     icon: Footprints, label: 'Runs' },
            { href: '/schedule', icon: Calendar,  label: 'Schedule' },
            { href: '/records',  icon: Trophy,    label: 'Records' },
            { href: '/settings', icon: Settings,  label: 'More' },
          ].map(({ href, icon: Icon, label }) => {
            const current = is(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition ${
                  current
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${current ? 'scale-110' : ''}`} />
                <span>{label}</span>
                {current && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
