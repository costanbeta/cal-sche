'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

interface AvailabilityRule {
  dayOfWeek: number
  startTime: string
  endTime: string
  timezone: string
}

export default function AvailabilityPage() {
  const router = useRouter()
  const [availability, setAvailability] = useState<AvailabilityRule[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'UTC' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', timezone: 'UTC' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', timezone: 'UTC' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', timezone: 'UTC' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', timezone: 'UTC' },
  ])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleDay = (dayOfWeek: number) => {
    const exists = availability.find(a => a.dayOfWeek === dayOfWeek)
    if (exists) {
      setAvailability(availability.filter(a => a.dayOfWeek !== dayOfWeek))
    } else {
      setAvailability([
        ...availability,
        { dayOfWeek, startTime: '09:00', endTime: '17:00', timezone: 'UTC' },
      ])
    }
  }

  const handleUpdateTime = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(
      availability.map(a =>
        a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save availability')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Availability Settings</h1>
          <p className="text-gray-600 mb-6">
            Set your regular weekly hours when people can book meetings with you
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                Availability saved successfully!
              </div>
            )}

            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const rule = availability.find(a => a.dayOfWeek === day.value)
                const isEnabled = !!rule

                return (
                  <div
                    key={day.value}
                    className={`border rounded-lg p-4 ${
                      isEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`day-${day.value}`}
                          checked={isEnabled}
                          onChange={() => handleToggleDay(day.value)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`day-${day.value}`}
                          className="font-medium text-gray-900 cursor-pointer"
                        >
                          {day.label}
                        </label>
                      </div>

                      {isEnabled && rule && (
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={rule.startTime}
                            onChange={(e) => handleUpdateTime(day.value, 'startTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={rule.endTime}
                            onChange={(e) => handleUpdateTime(day.value, 'endTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> These are your general working hours. You can add date-specific overrides for vacations or special hours later.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || availability.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
