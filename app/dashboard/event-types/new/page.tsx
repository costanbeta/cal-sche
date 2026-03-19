'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Video, Loader2, Check, ExternalLink, Link2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '60 min', 'Custom'] as const
const LOCATION_OPTIONS = [
  { label: 'Zoom', value: 'zoom', icon: '📹' },
  { label: 'Google Meet', value: 'google_meet', icon: '📹' },
  { label: 'Phone Call', value: 'phone', icon: '📞' },
  { label: 'In Person', value: 'in_person', icon: '🏢' },
  { label: 'Custom link', value: 'custom', icon: '🔗' },
] as const

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function parseDuration(label: string): number {
  const num = parseInt(label)
  return isNaN(num) ? 0 : num
}

interface IntegrationStatus {
  zoom: { connected: boolean; email: string | null }
  google_meet: { connected: boolean }
}

interface EventUsage {
  current: number
  limit: number
  allowed: boolean
}

export default function NewEventTypePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<string>('30 min')
  const [customDuration, setCustomDuration] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('zoom')
  const [meetingLink, setMeetingLink] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)
  const [eventUsage, setEventUsage] = useState<EventUsage | null>(null)

  useEffect(() => {
    fetchIntegrationStatus()
    fetchEventUsage()
  }, [])

  useEffect(() => {
    const zoomStatus = searchParams.get('zoom')
    const error = searchParams.get('error')
    if (zoomStatus === 'connected') {
      toast.success('Zoom account connected successfully!')
      fetchIntegrationStatus()
    }
    if (error === 'zoom_callback_failed') {
      toast.error('Failed to connect Zoom account. Please try again.')
    }
  }, [searchParams])

  const fetchIntegrationStatus = async () => {
    try {
      const res = await fetch('/api/integrations/status')
      if (res.ok) {
        const data = await res.json()
        setIntegrations(data)
      }
    } catch {
      // Silently fail - user may not be logged in yet
    }
  }

  const fetchEventUsage = async () => {
    try {
      const res = await fetch('/api/event-types/usage')
      if (res.ok) {
        setEventUsage(await res.json())
      }
    } catch {
      // Silently fail
    }
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setUrl(slugify(value))
  }

  const duration =
    selectedDuration === 'Custom'
      ? parseInt(customDuration) || 0
      : parseDuration(selectedDuration)

  const showMeetingLink =
    selectedLocation === 'zoom' ||
    selectedLocation === 'google_meet' ||
    selectedLocation === 'custom'

  const generateMeetingLink = async () => {
    setGeneratingLink(true)
    try {
      let endpoint = ''
      let body = {}

      if (selectedLocation === 'zoom') {
        endpoint = '/api/integrations/zoom/create-meeting'
        body = {
          topic: name || 'Meeting',
          duration: duration || 30,
        }
      } else if (selectedLocation === 'google_meet') {
        endpoint = '/api/integrations/google-meet/create-meeting'
        body = {
          summary: name || 'Meeting',
          duration: duration || 30,
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate link')
      }

      setMeetingLink(data.meetingLink)
      toast.success('Meeting link generated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate meeting link')
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const toastId = toast.loading('Loading...')

    try {
      const response = await fetch('/api/event-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: url || slugify(name),
          description,
          duration,
          isActive,
          location: selectedLocation,
          ...(showMeetingLink && meetingLink ? { meetingLink } : {}),
        }),
      })

      const data = await response.json()

      if (response.status === 403 && data.limit) {
        toast.error(
          `Event limit reached (${data.current}/${data.limit}). Delete an existing event to create a new one.`,
          { id: toastId }
        )
        setEventUsage({ current: data.current, limit: data.limit, allowed: false })
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event type')
      }

      toast.success('Event Saved', { id: toastId })
      setTimeout(() => router.push('/dashboard/event-types'), 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message, { id: toastId })
    }
  }

  const isZoomConnected = integrations?.zoom?.connected ?? false
  const isGoogleConnected = integrations?.google_meet?.connected ?? false

  return (
    <div className="flex-1 p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link
          href="/dashboard/event-types"
          className="hover:text-foreground transition-colors"
        >
          Events
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>New Event</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Event</h1>
          <p className="text-base text-muted-foreground mt-1">Create a new Event</p>
        </div>
        {eventUsage && (
          <span className="text-sm text-muted-foreground tabular-nums mt-1">
            {eventUsage.current}/{eventUsage.limit} events used
          </span>
        )}
      </div>

      {/* Limit reached banner */}
      {eventUsage && !eventUsage.allowed && (
        <Card className="mb-6 border-destructive bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Event limit reached ({eventUsage.current}/{eventUsage.limit})
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve used all available event slots. Delete an existing event to create a new one.
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/dashboard/event-types">Manage Events</Link>
          </Button>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Name + URL row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="30-minute meeting"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-url">URL</Label>
            <Input
              id="event-url"
              placeholder="30-min-meeting"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of what this meeting is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Duration + Location row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div className="space-y-3">
            <Label>Duration</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedDuration(opt)}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium transition-colors border',
                    selectedDuration === opt
                      ? 'bg-secondary border-border text-secondary-foreground'
                      : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selectedDuration === 'Custom' && (
              <Input
                type="number"
                min={1}
                placeholder="Enter minutes"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Meeting Location */}
          <div className="space-y-3">
            <Label>Meeting Location</Label>
            <div className="flex flex-wrap gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(opt.value)
                    setMeetingLink('')
                  }}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium transition-colors border',
                    selectedLocation === opt.value
                      ? 'bg-secondary border-border text-secondary-foreground'
                      : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meeting link / integration section */}
        {showMeetingLink && (
          <div className="space-y-4 rounded-lg border border-border p-5 bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Video className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                {selectedLocation === 'zoom' && 'Zoom Meeting Link'}
                {selectedLocation === 'google_meet' && 'Google Meet Link'}
                {selectedLocation === 'custom' && 'Custom Meeting Link'}
              </Label>
            </div>

            {/* Zoom section */}
            {selectedLocation === 'zoom' && (
              <>
                {isZoomConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <Check className="h-3.5 w-3.5" />
                        <span>Zoom connected</span>
                      </div>
                      {integrations?.zoom?.email && (
                        <span className="text-muted-foreground">({integrations.zoom.email})</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Click 'Generate' or paste a link"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateMeetingLink}
                        disabled={generatingLink}
                        className="shrink-0"
                      >
                        {generatingLink ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Generate Link
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Generate a Zoom link automatically, or paste your own meeting URL.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your Zoom account to auto-generate meeting links, or paste a link manually.
                    </p>
                    <div className="flex gap-2 items-start">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          window.location.href = '/api/integrations/zoom/connect'
                        }}
                        className="shrink-0"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect Zoom
                      </Button>
                      <span className="text-xs text-muted-foreground pt-2.5">or</span>
                      <Input
                        placeholder="https://zoom.us/j/123456789"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Google Meet section */}
            {selectedLocation === 'google_meet' && (
              <>
                {isGoogleConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <Check className="h-3.5 w-3.5" />
                        <span>Google Calendar connected</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Click 'Generate' or paste a link"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateMeetingLink}
                        disabled={generatingLink}
                        className="shrink-0"
                      >
                        {generatingLink ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Generate Link
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Generate a Google Meet link automatically, or paste your own link.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your Google Calendar to auto-generate Meet links, or paste a link manually.
                    </p>
                    <div className="flex gap-2 items-start">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          window.location.href = '/api/calendar/connect'
                        }}
                        className="shrink-0"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect Google
                      </Button>
                      <span className="text-xs text-muted-foreground pt-2.5">or</span>
                      <Input
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Custom link section */}
            {selectedLocation === 'custom' && (
              <Input
                placeholder="https://your-meeting-link.com"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            )}

            {meetingLink && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-md">
                <Check className="h-3 w-3" />
                <span>Meeting link set</span>
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto underline hover:no-underline"
                >
                  Open link
                </a>
              </div>
            )}
          </div>
        )}

        {/* Active checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="is-active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked === true)}
          />
          <Label htmlFor="is-active" className="cursor-pointer">
            Active (visible on your booking page)
          </Label>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/event-types">Back</Link>
          </Button>
          <Button
            type="submit"
            disabled={eventUsage !== null && !eventUsage.allowed}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
