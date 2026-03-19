'use client'

import { useState, useEffect } from 'react'
import { Check, Clock, Video, Calendar, ChevronRight } from 'lucide-react'

const TIME_SLOTS = ['9:00 AM', '10:30 AM', '2:00 PM', '4:00 PM']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DATES = ['9', '10', '11', '12', '13']

export default function HeroMockup() {
  const [selectedSlot, setSelectedSlot] = useState(1)
  const [selectedDay, setSelectedDay] = useState(2)
  const [showConfirmed, setShowConfirmed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const showTimer = setTimeout(() => setShowConfirmed(true), 1200)

    const cycleTimer = setInterval(() => {
      setShowConfirmed(false)
      setTimeout(() => {
        setSelectedSlot((prev) => (prev + 1) % TIME_SLOTS.length)
        setSelectedDay((prev) => (prev + 1) % DAYS.length)
        setTimeout(() => setShowConfirmed(true), 500)
      }, 400)
    }, 3500)

    return () => {
      clearTimeout(showTimer)
      clearInterval(cycleTimer)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-full max-w-[340px] mx-auto lg:mx-0 select-none">
      {/* Main booking card */}
      <div
        className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-float"
        style={{ boxShadow: '0 25px 60px -10px rgba(0,0,0,0.5)' }}
      >
        {/* Card header */}
        <div className="bg-secondary/40 px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              VC
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Vijay Chouhan</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>30 min</span>
                <span>·</span>
                <Video className="h-3 w-3" />
                <span>Video Call</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Month */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              March 2026
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Day selector */}
          <div className="grid grid-cols-5 gap-1">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={`flex flex-col items-center gap-1 rounded-lg py-2 cursor-pointer transition-all duration-300 ${
                  selectedDay === i
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/80 text-muted-foreground'
                }`}
              >
                <span className="text-[10px] font-medium">{day}</span>
                <span className="text-sm font-bold">{DATES[i]}</span>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
              Available Times
            </p>
            {TIME_SLOTS.map((slot, i) => (
              <div
                key={slot}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-300 ${
                  selectedSlot === i
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <span>{slot}</span>
                {selectedSlot === i && (
                  <span className="flex items-center gap-1 text-xs animate-fade-in">
                    <Check className="h-3.5 w-3.5" />
                    Selected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating "Booking confirmed" notification */}
      <div
        className={`absolute -bottom-5 -right-5 bg-card border border-border rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 transition-all duration-500 ${
          showConfirmed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      >
        <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
          <Check className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-tight">Booking confirmed!</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {DAYS[selectedDay]}, {TIME_SLOTS[selectedSlot]}
          </p>
        </div>
      </div>

      {/* Floating attendees badge */}
      <div
        className="absolute -top-4 -left-4 bg-card border border-border rounded-xl shadow-xl px-3 py-2 flex items-center gap-2 animate-float-slow"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      >
        <div className="flex -space-x-1.5">
          {['#6366f1', '#ec4899', '#f59e0b'].map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {['A', 'B', 'C'][i]}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">+240 booked</p>
      </div>
    </div>
  )
}
