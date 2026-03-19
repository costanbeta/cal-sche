import Link from 'next/link'
import Logo from '@/components/Logo'
import BrandedFooter from '@/components/BrandedFooter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  ExternalLink,
  Gift,
  Users,
  BookOpen,
  Shield,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
} from 'lucide-react'

const impactItems = [
  {
    icon: BookOpen,
    title: 'Educational Support',
    description:
      'Funding education for underprivileged children, giving them access to quality learning and a brighter future.',
  },
  {
    icon: Heart,
    title: 'Medical Support',
    description:
      'Providing life-saving medical care and treatment to those who cannot afford healthcare.',
  },
  {
    icon: Users,
    title: 'Women Empowerment',
    description:
      'Empowering women through skill development programs, enabling financial independence and dignity.',
  },
  {
    icon: Shield,
    title: 'Child Protection',
    description:
      'Ensuring children feel safe and protected, and supporting orphanages across the country.',
  },
  {
    icon: Gift,
    title: 'Old Age Support',
    description:
      'Caring for the elderly, providing them comfort, companionship, and essential necessities.',
  },
  {
    icon: Users,
    title: 'Calamity Relief',
    description:
      'Providing immediate relief after natural disasters, helping communities rebuild and recover.',
  },
]

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" showText />
            <div className="flex gap-4 items-center">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <Button asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            This product is completely free
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Support a cause that
            <br />
            <span className="text-red-500">changes lives</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Croodle is 100% free to use — always. Instead of charging you, we
            encourage you to support{' '}
            <strong className="text-foreground">Abhilasha Foundation</strong>, a
            registered NGO empowering children, women, and the elderly across
            India.
          </p>

          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-10">
            All donations are tax exempt under Section 80G.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              asChild
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white gap-2"
            >
              <a
                href="https://www.abhilasha-foundation.org/donate.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heart className="h-4 w-4 fill-white" />
                Donate Now
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://www.abhilasha-foundation.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website
                <ExternalLink className="h-4 w-4 ml-1.5" />
              </a>
            </Button>
          </div>
        </section>

        {/* About Foundation */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-card border border-border rounded-2xl p-10 md:p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 mb-6">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              About Abhilasha Foundation
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-6">
              Abhilasha Foundation is a Mumbai-based registered NGO dedicated to
              transforming lives through education, healthcare, women
              empowerment, child protection, and elderly care. Every rupee you
              donate goes directly toward creating a better tomorrow for those
              in need.
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              &quot;The secret to happiness lies in helping others. Never
              underestimate the difference YOU can make in the lives of the
              poor, the abused and the helpless.&quot;
            </p>
          </div>
        </section>

        {/* Impact Areas */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Where your donation goes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your contribution directly funds life-changing programs across
              multiple areas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {impactItems.map((item) => (
              <Card key={item.title} className="p-6 bg-card border-border">
                <div className="rounded-lg bg-red-100 dark:bg-red-950 p-2.5 w-fit mb-4">
                  <item.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Bank Details */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How to Donate
            </h2>
            <p className="text-muted-foreground">
              Multiple ways to contribute to the cause
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Domestic */}
            <Card className="p-8 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Domestic Bank Transfer (India)
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  ['Account Name', 'Abhilasha Foundation'],
                  ['Bank', 'ICICI Bank'],
                  ['Branch', 'Gorai-Borivali (West)'],
                  ['Account No.', '121801000225'],
                  ['IFSC Code', 'ICIC0001218'],
                  ['City', 'Mumbai, Maharashtra'],
                  ['PAN No.', 'AAETA2987L'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">{label}</dt>
                    <dd className="font-medium text-foreground text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* International */}
            <Card className="p-8 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                International / Foreign Donors
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  ['Account Name', 'Abhilasha Foundation'],
                  ['Bank', 'State Bank of India'],
                  ['Branch', 'FCRA Cell, New Delhi Main Branch'],
                  ['Account No.', '40132054027'],
                  ['Account Type', 'Savings (FCRA)'],
                  ['IFSC Code', 'SBIN0000691'],
                  ['Swift Code', 'SBININBB104'],
                  ['PAN No.', 'AAETA2987L'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">{label}</dt>
                    <dd className="font-medium text-foreground text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-10 bg-card border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Contact Abhilasha Foundation
              </h2>
              <p className="text-muted-foreground text-sm">
                Reach out for any queries about donations or their work
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-sm text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Phone className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">+91 98702 34440</p>
                <p className="font-medium text-foreground">+91 84528 63322</p>
                <p className="font-medium text-foreground">+91 97699 86440</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-muted-foreground">Email</p>
                <a
                  href="mailto:info@abhilasha-foundation.org"
                  className="font-medium text-foreground hover:text-red-500 transition-colors"
                >
                  info@abhilasha-foundation.org
                </a>
                <p className="text-muted-foreground text-xs mt-1">
                  Mon–Sat, 10:00 AM – 6:00 PM
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium text-foreground text-center">
                  Laxmi Chhaya Bungalow, Plot 27-27,
                  <br />
                  RSC 11, Gorai-2, Borivali (W),
                  <br />
                  Mumbai – 400 091
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-12 text-center">
            <Heart className="h-12 w-12 text-red-500 fill-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Make a difference today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Croodle is free for everyone. Your kindness toward Abhilasha
              Foundation helps transform lives across India.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white gap-2"
            >
              <a
                href="https://www.abhilasha-foundation.org/donate.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heart className="h-4 w-4 fill-white" />
                Donate to Abhilasha Foundation
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Tax exempt under Section 80G &bull; All donations directly fund
              their programs
            </p>
          </div>
        </section>
      </main>

      <BrandedFooter variant="full" />
    </div>
  )
}
