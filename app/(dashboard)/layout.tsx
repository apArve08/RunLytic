// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Footprints, Home, Drill, ListChecks, LogOut, Calendar, TrendingUp, CalendarDays} from 'lucide-react'
import { Settings } from 'lucide-react'

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
      {/* Header */}

 
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
               {process.env.NODE_ENV === 'development' && (
        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
            DEV
        </span>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Footprints className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">RunTrack</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            <Link
              href="/monthly"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <Calendar className="w-4 h-4" />
              Monthly
            </Link>
              <Link
                href="/runs"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <ListChecks className="w-4 h-4" />
                Runs
              </Link>
              <Link
                href="/progress"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <ListChecks className="w-4 h-4" />
                Progress
              </Link>
              <Link
  href="/schedule"
  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
>
  <CalendarDays className="w-4 h-4" />
  Schedule
</Link>
              <Link
                href="/shoes"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Drill className="w-4 h-4" />
                Shoes
              </Link>
              <Link
  href="/settings"
  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
>
  <Settings className="w-4 h-4" />
  Settings
</Link>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/runs" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-blue-600">
            <ListChecks className="w-5 h-5" />
            <span className="text-xs">Runs</span>
          </Link>
          <Link href="/shoes" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-blue-600">
            <Drill className="w-5 h-5" />
            <span className="text-xs">Shoes</span>
          </Link>
          <Link
                href="/progress"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <ListChecks className="w-4 h-4" />
                Progress
              </Link>
              <Link href="/schedule" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-blue-600">
  <CalendarDays className="w-5 h-5" />
  <span className="text-xs">Schedule</span>
</Link>
          
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}