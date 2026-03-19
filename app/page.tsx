import Link from 'next/link'
import Logo from '@/components/Logo'
import BrandedFooter from '@/components/BrandedFooter'
import HeroMockup from '@/components/HeroMockup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  RefreshCw,
  Mail,
  Palette,
  Users,
  Check,
  Heart,
  ExternalLink,
  ArrowRight,
  Zap,
  Shield,
} from 'lucide-react'

const stats = [
  { value: '5,000+', label: 'Professionals' },
  { value: '120K+', label: 'Meetings Scheduled' },
  { value: '2 min', label: 'Setup Time' },
  { value: '100%', label: 'Free Forever' },
]

const features = [
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description:
      'Create custom event types with your availability. Share your link and let others book time with you instantly.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: RefreshCw,
    title: 'Calendar Sync',
    description:
      'Connect your Google Calendar to prevent double-booking and automatically add meetings to your calendar.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Mail,
    title: 'Smart Notifications',
    description:
      'Automatic email confirmations and reminders for both you and your attendees. Never miss a meeting.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description:
      'Add your logo, brand colors, and custom messaging to create a professional booking experience.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Shield,
    title: 'Out of Office',
    description:
      'Block specific dates and date ranges so bookings only happen when you are actually available.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Zap,
    title: 'Instant Setup',
    description:
      'Go from sign-up to your first booking in under 2 minutes. No technical knowledge required.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
]

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your free account in seconds. No credit card required.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Set Availability',
    description: 'Define your working hours and create custom event types.',
    icon: Calendar,
  },
  {
    number: '03',
    title: 'Share Your Link',
    description: 'Send your personalized booking page to anyone, anywhere.',
    icon: ArrowRight,
  },
  {
    number: '04',
    title: 'Get Booked',
    description: 'Let others schedule meetings with you automatically.',
    icon: Zap,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" showText />
            <div className="flex gap-4 items-center">
              <Link
                href="/donate"
                className="hidden sm:flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
              >
                <Heart className="h-3.5 w-3.5 fill-red-500" />
                Donate
              </Link>
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Button asChild size="sm" className="animate-glow-pulse">
                <Link href="/auth/signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 overflow-hidden">
          {/* Background radial glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl animate-float-slow" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — headline & CTA */}
            <div>
              <div className="animate-fade-in-up">
                <Badge variant="secondary" className="mb-6 gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Trusted by 5,000+ professionals worldwide
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up animation-delay-100">
                Schedule smarter,
                <br />
                <span className="relative">
                  not harder
                  {/* Animated underline */}
                  <span
                    className="absolute bottom-1 left-0 h-0.5 bg-primary/40 animate-fade-in animation-delay-700"
                    style={{ width: '100%' }}
                  />
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 animate-fade-in-up animation-delay-200">
                Eliminate the back-and-forth emails. Share your scheduling link
                and let others book meetings with you instantly — completely free.
              </p>

              <div className="flex gap-3 flex-wrap animate-fade-in-up animation-delay-300">
                <Button asChild size="lg" className="group gap-2">
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">See Features</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground animate-fade-in-up animation-delay-400">
                {['Completely free', 'No credit card', 'Setup in 2 min'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-green-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — animated booking UI mockup */}
            <div className="animate-scale-in animation-delay-400">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────── */}
        <section className="border-y border-border bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`text-center animate-fade-in-up animation-delay-${(i + 1) * 100}`}
                >
                  <p className="text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────── */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28"
        >
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need for effortless scheduling
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage your time and grow your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className={`p-6 bg-card border-border hover:border-border/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-delay-${(i % 3) * 100 + 100}`}
              >
                <div className={`rounded-xl ${feature.bg} p-3 w-fit mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-foreground font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <section className="bg-secondary/20 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
            <div className="text-center mb-16 animate-fade-in-up">
              <Badge variant="secondary" className="mb-4">How it works</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Up and running in minutes
              </h2>
              <p className="text-muted-foreground">
                Four simple steps to professional scheduling
              </p>
            </div>

            <div className="relative grid md:grid-cols-4 gap-8">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`relative flex flex-col items-center text-center animate-fade-in-up animation-delay-${i * 100 + 100}`}
                >
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="md:hidden absolute top-1/2 left-full w-8 h-px bg-border -translate-y-1/2" />
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 animate-fade-in-up animation-delay-500">
              <Button asChild size="lg" className="group gap-2">
                <Link href="/auth/signup">
                  Start Scheduling Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Donate Banner ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-red-950/40 to-orange-950/30 border border-red-900/50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in-up">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <Heart className="h-5 w-5 text-red-400 fill-red-400" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">
                  This product is free
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Like what we&apos;re doing? Support Abhilasha Foundation
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Croodle is 100% free. Instead of charging you, we encourage you
                to donate to{' '}
                <strong className="text-foreground">Abhilasha Foundation</strong>{' '}
                — a registered NGO empowering underprivileged children, women,
                and the elderly across India.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white gap-2 whitespace-nowrap"
              >
                <Link href="/donate">
                  <Heart className="h-4 w-4 fill-white" />
                  Donate Here
                </Link>
              </Button>
              <a
                href="https://www.abhilasha-foundation.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                abhilasha-foundation.org
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
          <div className="relative bg-card border border-border rounded-2xl p-12 text-center overflow-hidden animate-fade-in-up">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl" />
            </div>

            <Badge variant="secondary" className="mb-6">Ready to start?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your scheduling link is waiting
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join 5,000+ professionals who simplified their scheduling — in
              under 2 minutes, for free.
            </p>
            <Button asChild size="lg" className="group gap-2 animate-glow-pulse">
              <Link href="/auth/signup">
                Create Your Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to use &bull; No credit card required &bull; Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <BrandedFooter variant="full" />
    </div>
  )
}
