// components/forms/ShoeForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FootprintsIcon, Calendar, Drill } from 'lucide-react'
import { Shoe } from '@/types/database'


export function ShoeForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    nickname: '',
    purchase_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/shoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          nickname: formData.nickname || null,
          purchase_date: formData.purchase_date || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create shoe')

      router.push('/shoes')
      router.refresh()
    } catch (err) {
      setError('Failed to add shoe. Please try again.')
      console.error('Error adding shoe:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nike, Adidas, Hoka..."
          required
        />
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Pegasus 40, Ultraboost..."
          required
        />
      </div>

      {/* Nickname */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nickname (optional)
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="My racing shoes, Daily trainer..."
        />
      </div>

      {/* Purchase Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4" />
          Purchase Date (optional)
        </label>
        <input
          type="date"
          value={formData.purchase_date}
          onChange={(e) =>
            setFormData({ ...formData, purchase_date: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          'Adding shoe...'
        ) : (
          <>
            <Drill className="w-5 h-5" />
            Add Shoe
          </>
        )}
      </button>
    </form>
  )
}