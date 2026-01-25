'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteRunButton({ runId }: { runId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this run?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/runs?id=${runId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/runs')
        router.refresh()
      } else {
        alert('Failed to delete run')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
    >
      <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
    </button>
  )
}