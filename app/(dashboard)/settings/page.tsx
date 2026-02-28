// app/(dashboard)/settings/page.tsx (ADD ThemeToggle)
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { StravaConnect } from '@/components/strava/StravaConnect'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your preferences and integrations
        </p>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Strava Integration */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Integrations
        </h2>
        <StravaConnect />
      </div>
    </div>
  )
}