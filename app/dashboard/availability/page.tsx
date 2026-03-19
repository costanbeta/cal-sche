'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import DashboardHeader from '@/components/DashboardHeader'

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const

interface DayAvailability {
  enabled: boolean
  startTime: string
  endTime: string
}

type WeekAvailability = Record<number, DayAvailability>

const DEFAULT_STATE: WeekAvailability = Object.fromEntries(
  DAYS.map(({ value }) => [
    value,
    { enabled: false, startTime: '00:00', endTime: '00:00' },
  ])
)

export default function AvailabilityPage() {
  const [week, setWeek] = useState<WeekAvailability>(DEFAULT_STATE)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/availability')
      .then((res) => res.json())
      .then((data) => {
        if (!data.availability?.length) return
        const next = { ...DEFAULT_STATE }
        for (const rule of data.availability) {
          next[rule.dayOfWeek] = {
            enabled: true,
            startTime: rule.startTime,
            endTime: rule.endTime,
          }
        }
        setWeek(next)
      })
      .catch(() => toast.error('Failed to load availability'))
  }, [])

  function toggleDay(day: number) {
    setWeek((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  function updateTime(day: number, field: 'startTime' | 'endTime', value: string) {
    setWeek((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  async function handleSave() {
    setSaving(true)
    const toastId = toast.loading('Saving availability…')

    const availability = DAYS.filter(({ value }) => week[value].enabled).map(
      ({ value }) => ({
        dayOfWeek: value,
        startTime: week[value].startTime,
        endTime: week[value].endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    )

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save availability')
      }

      toast.success('Availability saved', { id: toastId })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message, { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Availability"
        description="Set your regular weekly hours when people can book meetings with you"
        showSearch
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-lg border border-border overflow-hidden">
          {DAYS.map(({ value, label }) => {
            const day = week[value]
            return (
              <div
                key={value}
                className="flex items-center justify-between bg-card/50 border-b border-border px-4 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`day-${value}`}
                    checked={day.enabled}
                    onCheckedChange={() => toggleDay(value)}
                  />
                  <label
                    htmlFor={`day-${value}`}
                    className="text-base font-medium text-foreground cursor-pointer select-none"
                  >
                    {label}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="time"
                      value={day.startTime}
                      disabled={!day.enabled}
                      onChange={(e) => updateTime(value, 'startTime', e.target.value)}
                      className="w-[130px] pr-8"
                    />
                    <Clock className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>

                  <span className="text-sm text-muted-foreground">to</span>

                  <div className="relative">
                    <Input
                      type="time"
                      value={day.endTime}
                      disabled={!day.enabled}
                      onChange={(e) => updateTime(value, 'endTime', e.target.value)}
                      className="w-[130px] pr-8"
                    />
                    <Clock className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving}>
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  )
}
