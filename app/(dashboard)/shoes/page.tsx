// app/(dashboard)/shoes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Shoe } from '@/types/database'
import { ShoeForm } from '@/components/forms/ShoeForm'
import { Drill ,Plus, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function ShoesPage() {
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShoes()
  }, [])

  const fetchShoes = async () => {
    try {
      const response = await fetch('/api/shoes')
      const data = await response.json()
      setShoes(data.shoes || [])
    } catch (error) {
      console.error('Error fetching shoes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shoe?')) return

    try {
      await fetch(`/api/shoes?id=${id}`, { method: 'DELETE' })
      fetchShoes()
    } catch (error) {
      console.error('Error deleting shoe:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shoes</h1>
          <p className="text-gray-600 mt-1">Track your running shoe mileage</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Add Shoe'}
        </button>
      </div>

      {/* Add Shoe Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Shoe</h2>
          <ShoeForm />
        </div>
      )}

      {/* Shoes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading shoes...</p>
        </div>
      ) : shoes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shoes.map((shoe) => (
            <div
              key={shoe.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Drill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {shoe.nickname || shoe.model}
                    </h3>
                    <p className="text-sm text-gray-500">{shoe.brand}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(shoe.id)}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Distance</span>
                  <span className="font-semibold text-gray-900">
                    {shoe.total_distance.toFixed(1)} km
                  </span>
                </div>

                {shoe.purchase_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Purchased
                    </span>
                    <span className="text-sm text-gray-700">
                      {format(new Date(shoe.purchase_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {/* Retirement warning */}
                {shoe.total_distance >= 600 && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      ⚠️ Consider retiring these shoes (600+ km)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Drill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No shoes added yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Your First Shoe
          </button>
        </div>
      )}
    </div>
  )
}