// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Footprints,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Trophy,
  Heart,
  Cloud,
  Share2,
  Flame,
  BarChart3,
  Award,
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RunTrack</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              {/* Dashboard */}
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>

              {/* Runs */}
              <Link
                href="/runs"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Footprints className="w-4 h-4" />
                Runs
              </Link>

              {/* Analytics Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/progress"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition first:rounded-t-lg"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Progress Reports
                  </Link>
                  <Link
                    href="/records"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <Trophy className="w-4 h-4" />
                    Personal Records
                  </Link>
                  <Link
                    href="/zones"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <Heart className="w-4 h-4" />
                    Training Zones
                  </Link>
                  <Link
                    href="/weather"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition last:rounded-b-lg"
                  >
                    <Cloud className="w-4 h-4" />
                    Weather Analysis
                  </Link>
                </div>
              </div>

              {/* Training Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Calendar className="w-4 h-4" />
                  Training
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/schedule"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition first:rounded-t-lg"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </Link>
                  <Link
                    href="/monthly"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <Award className="w-4 h-4" />
                    Monthly Stats
                  </Link>
                  <Link
                    href="/shoes"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition last:rounded-b-lg"
                  >
                    <Footprints className="w-4 h-4" />
                    Shoes
                  </Link>
                </div>
              </div>

              {/* Share */}
              <Link
                href="/stats-widget"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Link>

              {/* Settings Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Settings className="w-4 h-4" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition first:rounded-t-lg"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition last:rounded-b-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RunTrack</span>
          </Link>
          <Link
            href="/runs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Log Run
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 gap-1">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-2 py-3 text-gray-600 hover:text-blue-600 transition"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            href="/runs"
            className="flex flex-col items-center gap-1 px-2 py-3 text-gray-600 hover:text-blue-600 transition"
          >
            <Footprints className="w-5 h-5" />
            <span className="text-xs">Runs</span>
          </Link>

          <Link
            href="/schedule"
            className="flex flex-col items-center
             gap-1 px-2 py-3 text-gray-600 hover:text-blue-600 transition"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Schedule</span>
          </Link>

          <Link
            href="/records"
            className="flex flex-col items-center gap-1 px-2 py-3 text-gray-600 hover:text-blue-600 transition"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Records</span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 px-2 py-3 text-gray-600 hover:text-blue-600 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">More</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}