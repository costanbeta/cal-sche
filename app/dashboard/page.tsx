'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, CalendarDays, X } from 'lucide-react'
import Link from 'next/link'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import DashboardHeader from '@/components/DashboardHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface User {
  id: string
  email: string
  name: string
  username: string
  timezone: string
}

interface EventType {
  id: string
  name: string
  slug: string
  duration: number
  color: string
  isActive: boolean
}

interface Booking {
  id: string
  attendeeName: string
  attendeeEmail: string
  startTime: string
  endTime: string
  timezone: string
  status: string
  eventType: EventType
}

interface EventUsage {
  current: number
  limit: number
  remaining: number
  allowed: boolean
}

interface StatPoint {
  label: string
  count: number
}

interface BookingStats {
  daily: StatPoint[]
  weekly: StatPoint[]
  monthly: StatPoint[]
}

type ChartPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return m === 0 ? `${hour}${ampm}` : `${hour}:${m.toString().padStart(2, '0')}${ampm}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [eventUsage, setEventUsage] = useState<EventUsage | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null)
  const [customData, setCustomData] = useState<StatPoint[] | null>(null)
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('daily')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [customLoading, setCustomLoading] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        router.push('/auth/login')
        return
      }
      const userData = await userRes.json()
      setUser(userData.user)

      const [eventTypesRes, bookingsRes, usageRes, availabilityRes, statsRes] = await Promise.all([
        fetch('/api/event-types'),
        fetch('/api/bookings?upcoming=true'),
        fetch('/api/event-types/usage'),
        fetch('/api/availability'),
        fetch('/api/bookings/stats'),
      ])

      if (eventTypesRes.ok) {
        const eventTypesData = await eventTypesRes.json()
        setEventTypes(eventTypesData.eventTypes)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setUpcomingBookings(bookingsData.bookings)
      }

      if (usageRes.ok) {
        setEventUsage(await usageRes.json())
      }

      if (availabilityRes.ok) {
        const availData = await availabilityRes.json()
        setAvailability(availData.availability ?? [])
      }

      if (statsRes.ok) {
        setBookingStats(await statsRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    if (calendarOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [calendarOpen])

  // Fetch custom range data when both dates selected
  const handleDateRangeSelect = useCallback(async (range: DateRange | undefined) => {
    setDateRange(range)
    if (!range?.from || !range?.to) return
    setCalendarOpen(false)
    setChartPeriod('custom')
    setCustomLoading(true)
    try {
      const from = format(range.from, 'yyyy-MM-dd')
      const to = format(range.to, 'yyyy-MM-dd')
      const res = await fetch(`/api/bookings/stats?from=${from}&to=${to}`)
      if (res.ok) {
        const data = await res.json()
        setCustomData(data.custom)
      }
    } catch (err) {
      console.error('Failed to fetch custom stats:', err)
    } finally {
      setCustomLoading(false)
    }
  }, [])

  const clearCustomRange = useCallback(() => {
    setDateRange(undefined)
    setCustomData(null)
    setChartPeriod('daily')
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const usageCurrent = eventUsage?.current ?? eventTypes.length
  const usageLimit = eventUsage?.limit ?? 10
  const usagePercent = Math.round((usageCurrent / usageLimit) * 100)

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`Hello, ${user?.name ?? 'there'}`}
        description="Welcome back!"
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Bookings */}
          <Card className="p-4">
            <p className="text-sm font-medium text-foreground">Total Booking</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {upcomingBookings.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {Math.min(upcomingBookings.length, 10)} new booking
            </p>
          </Card>

          {/* Total Events with usage */}
          <Card className="p-4">
            <p className="text-sm font-medium text-foreground">Total Events</p>
            <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">
              {usageCurrent}
              <span className="text-muted-foreground font-normal text-base">
                /{usageLimit}
              </span>
            </p>
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    usagePercent >= 100
                      ? 'bg-destructive'
                      : usagePercent >= 80
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {usageCurrent >= usageLimit
                  ? 'Limit reached'
                  : `${usageLimit - usageCurrent} remaining`}
              </p>
            </div>
          </Card>

          {/* Availability */}
          <Link href="/dashboard/availability" className="block group">
            <Card className="p-4 h-full transition-colors group-hover:border-border/60 group-hover:bg-muted/20">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-foreground">Availability</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5" />
              </div>
              {availability.length === 0 ? (
                <>
                  <p className="mt-1 text-xl font-semibold text-muted-foreground">Not set</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tap to configure your hours</p>
                </>
              ) : (
                <>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {DAY_NAMES.map((day, idx) => {
                      const slot = availability.find((a) => a.dayOfWeek === idx)
                      return (
                        <span
                          key={day}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            slot
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {day}
                        </span>
                      )
                    })}
                  </div>
                  {(() => {
                    const times = availability.map((a) => ({
                      start: a.startTime,
                      end: a.endTime,
                    }))
                    const earliestStart = times.reduce((min, t) => t.start < min ? t.start : min, times[0].start)
                    const latestEnd = times.reduce((max, t) => t.end > max ? t.end : max, times[0].end)
                    return (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {formatTime(earliestStart)} – {formatTime(latestEnd)} · {availability.length} day{availability.length !== 1 ? 's' : ''}
                      </p>
                    )
                  })()}
                </>
              )}
            </Card>
          </Link>
        </div>

        {/* Bookings Chart */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Bookings Over Time</p>
              {chartPeriod === 'custom' && dateRange?.from && dateRange?.to && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(dateRange.from, 'MMM d, yyyy')} – {format(dateRange.to, 'MMM d, yyyy')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Preset period tabs */}
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {(['daily', 'weekly', 'monthly'] as ChartPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => { setChartPeriod(period); setDateRange(undefined); setCustomData(null) }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      chartPeriod === period
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {period === 'daily' ? 'Day' : period === 'weekly' ? 'Week' : 'Month'}
                  </button>
                ))}
              </div>

              {/* Calendar range picker */}
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setCalendarOpen((o) => !o)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    chartPeriod === 'custom'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                  title="Select date range"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {chartPeriod === 'custom' ? 'Custom' : 'Range'}
                </button>

                {chartPeriod === 'custom' && (
                  <button
                    onClick={clearCustomRange}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-muted-foreground text-background flex items-center justify-center hover:bg-foreground transition-colors"
                    title="Clear custom range"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}

                {calendarOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      disabled={{ after: new Date() }}
                      classNames={{
                        months: 'flex gap-4 p-3',
                        month: 'space-y-3',
                        caption: 'flex justify-center items-center relative',
                        caption_label: 'text-sm font-medium text-foreground',
                        nav: 'flex items-center gap-1',
                        nav_button: 'h-7 w-7 rounded-md bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center',
                        nav_button_previous: 'absolute left-0',
                        nav_button_next: 'absolute right-0',
                        table: 'w-full border-collapse',
                        head_row: 'flex',
                        head_cell: 'text-muted-foreground text-[11px] font-medium w-8 text-center',
                        row: 'flex w-full mt-1',
                        cell: 'h-8 w-8 text-center text-sm relative focus-within:relative focus-within:z-20',
                        day: 'h-8 w-8 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center',
                        day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                        day_range_start: 'bg-primary text-primary-foreground rounded-l-md rounded-r-none',
                        day_range_end: 'bg-primary text-primary-foreground rounded-r-md rounded-l-none',
                        day_range_middle: 'bg-primary/15 text-foreground rounded-none',
                        day_today: 'border border-border',
                        day_outside: 'text-muted-foreground opacity-40',
                        day_disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
                      }}
                    />
                    {dateRange?.from && !dateRange?.to && (
                      <p className="text-xs text-muted-foreground text-center pb-3">
                        Select an end date
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-56">
            {customLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : chartPeriod === 'custom' ? (
              customData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.max(0, Math.floor((customData.length - 1) / 6))}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'hsl(var(--foreground))',
                      }}
                      cursor={{ stroke: 'hsl(var(--border))' }}
                      formatter={(value) => [value ?? 0, 'Bookings']}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Select a date range to view data
                </div>
              )
            ) : bookingStats ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={bookingStats[chartPeriod as 'daily' | 'weekly' | 'monthly']}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval={chartPeriod === 'daily' ? 4 : 0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                    }}
                    cursor={{ stroke: 'hsl(var(--border))' }}
                    formatter={(value: number) => [value, 'Bookings']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading chart...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
