'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CalendarCheck2,
  CalendarOff,
  Loader2,
  Unplug,
  Calendar,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

import DashboardHeader from '@/components/DashboardHeader'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

interface BrandingSettings {
  companyName: string
  logoUrl: string
  primaryColor: string
  footerText: string
  hidePoweredBy: boolean
}

interface CalendarStatus {
  connected: boolean
  connection?: {
    id: string
    provider: string
    createdAt: string
  }
}

interface DateOverride {
  id: string
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}

const DEFAULT_BRANDING: BrandingSettings = {
  companyName: '',
  logoUrl: '',
  primaryColor: '#6366f1',
  footerText: '',
  hidePoweredBy: false,
}

export default function SettingsPage() {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING)
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>({ connected: false })
  const [loadingBranding, setLoadingBranding] = useState(true)
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [savingBranding, setSavingBranding] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([])
  const [loadingOOO, setLoadingOOO] = useState(false)
  const [singleDate, setSingleDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteOverrideTarget, setDeleteOverrideTarget] = useState<{ id: string; label: string } | null>(null)

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/users/branding')
      if (res.ok) {
        const data = await res.json()
        const b = data.branding || data
        setBranding({
          companyName: b.brandName ?? '',
          logoUrl: b.brandLogoUrl ?? '',
          primaryColor: b.brandColor ?? '#6366f1',
          footerText: b.customFooterText ?? '',
          hidePoweredBy: b.hidePoweredBy ?? false,
        })
      }
    } catch {
      toast.error('Failed to load branding settings')
    } finally {
      setLoadingBranding(false)
    }
  }, [])

  const fetchCalendarStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/status')
      if (res.ok) {
        const data = await res.json()
        setCalendarStatus(data)
      }
    } catch {
      console.error('Failed to fetch calendar status')
    } finally {
      setLoadingCalendar(false)
    }
  }, [])

  const loadDateOverrides = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const res = await fetch(`/api/date-overrides?startDate=${today}`)
      if (res.ok) {
        const data = await res.json()
        setDateOverrides(data.dateOverrides)
      }
    } catch {
      console.error('Failed to load date overrides')
    }
  }, [])

  useEffect(() => {
    fetchBranding()
    fetchCalendarStatus()
    loadDateOverrides()
  }, [fetchBranding, fetchCalendarStatus, loadDateOverrides])

  const handleSaveBranding = async () => {
    setSavingBranding(true)
    const toastId = toast.loading('Saving branding settings…')
    try {
      const res = await fetch('/api/users/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: branding.companyName,
          brandLogoUrl: branding.logoUrl,
          brandColor: branding.primaryColor,
          customFooterText: branding.footerText,
          hidePoweredBy: branding.hidePoweredBy,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      toast.success('Branding settings saved', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to save branding settings', { id: toastId })
    } finally {
      setSavingBranding(false)
    }
  }

  const handleConnectCalendar = async () => {
    try {
      const res = await fetch('/api/calendar/connect')
      const data = await res.json()
      if (res.ok && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        toast.error(data.error || 'Failed to initiate Google Calendar connection')
      }
    } catch {
      toast.error('Failed to connect Google Calendar')
    }
  }

  const handleDisconnectCalendar = async () => {
    setDisconnecting(true)
    const toastId = toast.loading('Disconnecting…')
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error()
      setCalendarStatus({ connected: false })
      toast.success('Google Calendar disconnected', { id: toastId })
    } catch {
      toast.error('Failed to disconnect Google Calendar', { id: toastId })
    } finally {
      setDisconnecting(false)
    }
  }

  const handleBlockSingleDate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingOOO(true)
    const toastId = toast.loading('Blocking date…')
    try {
      const res = await fetch('/api/date-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: singleDate, isAvailable: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to block date')
      toast.success(`Blocked ${singleDate}`, { id: toastId })
      setSingleDate('')
      loadDateOverrides()
      if (data.warningBookings?.length > 0) {
        toast.warning(`${data.warningBookings.length} existing booking(s) on this date`)
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    } finally {
      setLoadingOOO(false)
    }
  }

  const handleBlockDateRange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingOOO(true)
    const toastId = toast.loading('Blocking date range…')
    try {
      const res = await fetch('/api/date-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, isAvailable: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to block date range')
      toast.success(data.message || 'Date range blocked', { id: toastId })
      setStartDate('')
      setEndDate('')
      loadDateOverrides()
      if (data.warningBookings?.length > 0) {
        toast.warning(`${data.warningBookings.length} existing booking(s) in this range`)
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    } finally {
      setLoadingOOO(false)
    }
  }

  const handleDeleteOverride = async () => {
    if (!deleteOverrideTarget) return
    const toastId = toast.loading('Removing block…')
    try {
      const res = await fetch(`/api/date-overrides/${deleteOverrideTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Date unblocked', { id: toastId })
      loadDateOverrides()
    } catch {
      toast.error('Failed to remove block', { id: toastId })
    } finally {
      setDeleteOverrideTarget(null)
    }
  }

  const brandColorValue = branding.primaryColor

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Settings"
        description="Manage your account preferences"
        showSearch
      />

      <div className="flex-1 p-6">
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="bg-muted/50 rounded-lg">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="google-calendar">Google Calendar</TabsTrigger>
            <TabsTrigger value="out-of-office">Out of Office</TabsTrigger>
          </TabsList>

          {/* ── Branding ── */}
          <TabsContent value="branding" className="mt-6">
            {loadingBranding ? (
              <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading branding settings…</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Form */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Brand Name</Label>
                      <Input
                        id="company-name"
                        placeholder="Your Company Name"
                        value={branding.companyName}
                        maxLength={50}
                        onChange={(e) =>
                          setBranding((b) => ({ ...b, companyName: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Displayed on your booking page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Brand Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding((b) => ({ ...b, primaryColor: e.target.value }))
                          }
                          className="h-10 w-14 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                        />
                        <Input
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding((b) => ({ ...b, primaryColor: e.target.value }))
                          }
                          className="max-w-[140px] font-mono"
                          placeholder="#6366f1"
                          pattern="^#[A-Fa-f0-9]{6}$"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for buttons and accents on your booking page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <Input
                        id="logo-url"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={branding.logoUrl}
                        onChange={(e) =>
                          setBranding((b) => ({ ...b, logoUrl: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your logo to a hosting service and paste the URL here
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footer-text">Custom Footer Text</Label>
                      <Textarea
                        id="footer-text"
                        placeholder="Add a custom message at the bottom of your booking page"
                        value={branding.footerText}
                        rows={3}
                        maxLength={200}
                        className="resize-none"
                        onChange={(e) =>
                          setBranding((b) => ({ ...b, footerText: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {branding.footerText.length}/200 characters
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="hide-powered-by"
                        checked={branding.hidePoweredBy}
                        onCheckedChange={(checked) =>
                          setBranding((b) => ({ ...b, hidePoweredBy: checked === true }))
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="hide-powered-by" className="cursor-pointer">
                          Hide &ldquo;Powered by Croodle&rdquo;
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Remove our branding from your booking page
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleSaveBranding}
                        disabled={savingBranding}
                        className="w-full"
                      >
                        {savingBranding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Branding Settings
                      </Button>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Preview</h3>
                    <div className="rounded-lg border-2 border-border p-6 space-y-5 bg-background">
                      {/* Logo */}
                      {branding.logoUrl ? (
                        <div className="flex justify-center">
                          <img
                            src={branding.logoUrl}
                            alt="Brand Logo"
                            className="max-w-[180px] max-h-[50px] object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-28 h-10 bg-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                            Your Logo
                          </div>
                        </div>
                      )}

                      {/* Brand Name */}
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-foreground">
                          {branding.companyName || 'Your Brand Name'}
                        </h4>
                        <p className="text-muted-foreground text-xs mt-1">@username</p>
                      </div>

                      {/* Sample Event */}
                      <div
                        className="border-2 rounded-lg p-3 transition"
                        style={{ borderColor: brandColorValue }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg shrink-0"
                            style={{ backgroundColor: brandColorValue }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">Sample Meeting</p>
                            <p className="text-xs text-muted-foreground">30 min · Video Call</p>
                          </div>
                        </div>
                      </div>

                      {/* Sample Button */}
                      <button
                        className="w-full py-2.5 text-white rounded-lg text-sm font-semibold transition"
                        style={{ backgroundColor: brandColorValue }}
                      >
                        Book Meeting
                      </button>

                      {/* Footer */}
                      <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border">
                        {branding.footerText && (
                          <p className="mb-2">{branding.footerText}</p>
                        )}
                        {!branding.hidePoweredBy && (
                          <p className="flex items-center justify-center gap-1">
                            Powered by <Logo size="sm" />
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/40 border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        <Sparkles className="inline h-3 w-3 mr-1" />
                        <strong className="text-foreground">Tip:</strong> Changes are applied
                        immediately to your public booking page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Google Calendar Integration ── */}
          <TabsContent value="google-calendar" className="mt-6 max-w-3xl">
            {loadingCalendar ? (
              <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Checking calendar status…</span>
              </div>
            ) : calendarStatus.connected ? (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Your Google Calendar is connected. Bookings sync automatically.
                </p>

                <div className="flex items-center gap-3 rounded-lg border border-green-800/40 bg-green-950/30 p-4">
                  <CalendarCheck2 className="h-5 w-5 text-green-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-300">Connected</p>
                    {calendarStatus.connection?.createdAt && (
                      <p className="text-xs text-green-400/70">
                        Connected on{' '}
                        {new Date(calendarStatus.connection.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">What&apos;s syncing:</h3>
                  <ul className="space-y-2.5">
                    {[
                      'Busy times are excluded from your available slots',
                      'New bookings are added to your Google Calendar',
                      'Attendees receive calendar invites with meeting details',
                      'Cancelled bookings are removed from your calendar',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CalendarCheck2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleDisconnectCalendar}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Unplug className="mr-2 h-4 w-4" />
                  )}
                  Disconnect Google Calendar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Sync your bookings with Google Calendar and prevent double-bookings.
                </p>

                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
                  <CalendarOff className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Connect your Google Calendar to enable automatic syncing and prevent double-bookings.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Benefits of connecting:</h3>
                  <ul className="space-y-2.5">
                    {[
                      'Available time slots automatically exclude your Google Calendar busy times',
                      'New bookings are instantly added to your Google Calendar',
                      'Attendees receive Google Calendar invites with meeting details',
                      'Cancelled bookings are automatically removed from your calendar',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={handleConnectCalendar} variant="outline" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Connect Google Calendar
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Out of Office ── */}
          <TabsContent value="out-of-office" className="mt-6 max-w-3xl">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Block specific dates or date ranges when you&apos;re unavailable. Blocked dates show no time slots to bookers.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Block single date */}
                <div className="rounded-lg border border-border p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Block Single Date</h3>
                  <form onSubmit={handleBlockSingleDate} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ooo-single">Date</Label>
                      <Input
                        id="ooo-single"
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
                      size="sm"
                      className="w-full"
                      disabled={loadingOOO || !singleDate}
                    >
                      {loadingOOO ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                      Block Date
                    </Button>
                  </form>
                </div>

                {/* Block date range */}
                <div className="rounded-lg border border-border p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Block Date Range</h3>
                  <p className="text-xs text-muted-foreground">Perfect for vacations or extended time off</p>
                  <form onSubmit={handleBlockDateRange} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ooo-start">Start Date</Label>
                      <Input
                        id="ooo-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ooo-end">End Date</Label>
                      <Input
                        id="ooo-end"
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
                      size="sm"
                      className="w-full"
                      disabled={loadingOOO || !startDate || !endDate}
                    >
                      {loadingOOO ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                      Block Range
                    </Button>
                  </form>
                </div>
              </div>

              {/* Blocked dates list */}
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Blocked Dates</h3>
                {dateOverrides.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No blocked dates</p>
                    <p className="mt-1 text-xs text-muted-foreground">Block dates above to prevent bookings</p>
                  </div>
                ) : (
                  <div className="max-h-[320px] space-y-2 overflow-y-auto">
                    {dateOverrides.map((override) => (
                      <div
                        key={override.id}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition hover:bg-accent"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(parseISO(override.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-xs text-destructive">
                            {override.isAvailable ? 'Custom hours' : 'Blocked all day'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteOverrideTarget({
                              id: override.id,
                              label: format(parseISO(override.date), 'MMMM d, yyyy'),
                            })
                          }
                          title="Remove block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete date override confirmation */}
      <AlertDialog open={!!deleteOverrideTarget} onOpenChange={(open) => !open && setDeleteOverrideTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Blocked Date</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock {deleteOverrideTarget?.label}? This will re-open availability for that date.
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
