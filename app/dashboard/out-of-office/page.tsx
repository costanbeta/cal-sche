'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

  const [singleDate, setSingleDate] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

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

  const handleDeleteOverride = async () => {
    if (!deleteTarget) return

    try {
      const response = await fetch(`/api/date-overrides/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Date unblocked successfully')
        loadDateOverrides()
      }
    } catch (err) {
      setError('Failed to delete date override')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Out of Office</h1>
        <p className="mt-2 text-muted-foreground">
          Block specific dates or date ranges when you&apos;re unavailable
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-500">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Block Single Date
              </h2>
              <form onSubmit={handleBlockSingleDate} className="space-y-4">
                <div>
                  <Label className="mb-2">Select Date</Label>
                  <Input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full font-semibold"
                  disabled={loading || !singleDate}
                >
                  {loading ? 'Blocking...' : 'Block This Date'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Block Date Range
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Perfect for vacations or extended time off
              </p>
              <form onSubmit={handleBlockDateRange} className="space-y-4">
                <div>
                  <Label className="mb-2">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <div>
                  <Label className="mb-2">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full font-semibold"
                  disabled={loading || !startDate || !endDate}
                >
                  {loading ? 'Blocking...' : 'Block Date Range'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Blocked Dates
            </h2>

            {dateOverrides.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No blocked dates</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Block dates to prevent bookings
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] space-y-3 overflow-y-auto">
                {dateOverrides.map((override) => (
                  <div
                    key={override.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {format(parseISO(override.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-destructive">
                        {override.isAvailable ? 'Custom hours' : 'Blocked all day'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDeleteTarget({
                          id: override.id,
                          label: format(parseISO(override.date), 'MMMM d, yyyy'),
                        })
                      }
                      className="text-destructive hover:text-destructive"
                      title="Remove block"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-secondary">
        <CardContent className="p-6">
          <h3 className="mb-2 font-semibold text-foreground">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Blocked dates will show no available time slots to bookers</li>
            <li>• You&apos;ll be warned if you try to block dates with existing bookings</li>
            <li>• Use date ranges for vacations or extended time off</li>
            <li>• Remove blocks anytime to re-open availability</li>
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Blocked Date</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock {deleteTarget?.label}? This will re-open availability for that date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Blocked</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOverride}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unblock Date
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
