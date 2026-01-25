// app/(dashboard)/runs/page.tsx
import { createClient } from '@/lib/supabase/server'
import { RunCard } from '@/components/dashboard/RunCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RunsPage() {
  const supabase = await createClient()

  const { data: runs } = await supabase
    .from('runs')
    .select(
      `
      *,
      shoes:shoes_id (
        id,
        brand,
        model,
        nickname
      )
    `
    )
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Runs</h1>
          <p className="text-gray-600 mt-1">{runs?.length || 0} total runs</p>
        </div>
        <Link
          href="/runs/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Run
        </Link>
      </div>

      {/* Runs List */}
      {runs && runs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No runs logged yet</p>
          <Link
            href="/runs/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Log Your First Run
          </Link>
        </div>
      )}
    </div>
  )
}