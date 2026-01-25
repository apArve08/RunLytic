// app/(dashboard)/runs/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { RunForm } from '@/components/forms/RunForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewRunPage() {
  const supabase = await createClient()

  const { data: shoes } = await supabase
    .from('shoes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/runs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to runs
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Log a Run</h1>
        <p className="text-gray-600 mt-1">Record your running activity</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <RunForm shoes={shoes || []} />
      </div>
    </div>
  )
}