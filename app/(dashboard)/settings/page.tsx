// app/(dashboard)/settings/page.tsx
import { StravaConnect } from '@/components/strava/StravaConnect'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and integrations</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integrations</h2>
          <StravaConnect />
        </div>
      </div>
    </div>
  )
}