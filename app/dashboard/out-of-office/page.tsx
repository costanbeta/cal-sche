'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface DateOverride {
  id: string
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}

export default function OutOfOfficePage() {
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Single date form
  const [singleDate, setSingleDate] = useState('')
  
  // Date range form
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Load existing date overrides
  useEffect(() => {
    loadDateOverrides()
  }, [])
  
  const loadDateOverrides = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await fetch(`/api/date-overrides?startDate=${today}`)
      
      if (response.ok) {
        const data = await response.json()
        setDateOverrides(data.dateOverrides)
      }
    } catch (err) {
      console.error('Failed to load date overrides:', err)
    }
  }
  
  const handleBlockSingleDate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/date-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: singleDate,
          isAvailable: false,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to block date')
      }
      
      setSuccess(`Successfully blocked ${singleDate}`)
      setSingleDate('')
      loadDateOverrides()
      
      if (data.warningBookings && data.warningBookings.length > 0) {
        setError(`Warning: ${data.warningBookings.length} existing booking(s) on this date`)
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleBlockDateRange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/date-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          isAvailable: false,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to block date range')
      }
      
      setSuccess(data.message || 'Successfully blocked date range')
      setStartDate('')
      setEndDate('')
      loadDateOverrides()
      
      if (data.warningBookings && data.warningBookings.length > 0) {
        setError(`Warning: ${data.warningBookings.length} existing booking(s) in this range`)
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteOverride = async (id: string, date: string) => {
    if (!confirm(`Remove block for ${date}?`)) return
    
    try {
      const response = await fetch(`/api/date-overrides/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setSuccess('Date unblocked successfully')
        loadDateOverrides()
      }
    } catch (err) {
      setError('Failed to delete date override')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Out of Office</h1>
          <p className="mt-2 text-gray-600">
            Block specific dates or date ranges when you&apos;re unavailable
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            {/* Block Single Date */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Block Single Date
              </h2>
              <form onSubmit={handleBlockSingleDate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !singleDate}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Blocking...' : 'Block This Date'}
                </button>
              </form>
            </div>

            {/* Block Date Range */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Block Date Range
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Perfect for vacations or extended time off
              </p>
              <form onSubmit={handleBlockDateRange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !startDate || !endDate}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Blocking...' : 'Block Date Range'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: List of Blocked Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Blocked Dates
            </h2>
            
            {dateOverrides.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-4 text-gray-500">No blocked dates</p>
                <p className="text-sm text-gray-400 mt-1">
                  Block dates to prevent bookings
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {dateOverrides.map((override) => (
                  <div
                    key={override.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(parseISO(override.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-red-600">
                        {override.isAvailable ? 'Custom hours' : 'Blocked all day'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOverride(override.id, format(parseISO(override.date), 'MMM d, yyyy'))}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Remove block"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Blocked dates will show no available time slots to bookers</li>
            <li>• You&apos;ll be warned if you try to block dates with existing bookings</li>
            <li>• Use date ranges for vacations or extended time off</li>
            <li>• Remove blocks anytime to re-open availability</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
