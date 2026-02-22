'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, Eye, LogIn } from 'lucide-react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setFormData({ ...formData, username: sanitized })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      sessionStorage.setItem('verificationEmail', formData.email)
      router.push('/auth/verify-email-pending')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Side - Branding with Image Background */}
      <div className="hidden lg:flex lg:w-[640px] relative bg-neutral-800 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/signup-bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 w-full">
          {/* Logo */}
          <Link href="/">
            <Logo size="md" showText={true} />
          </Link>

          {/* Testimonial */}
          <div className="text-white">
            <p className="text-base leading-relaxed">
              &quot;This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.&quot; - Sofia Davis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[350px] space-y-6">
          {/* Form Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Create an account
            </h1>
            <p className="text-xs text-white">
              Let&apos;s get started. Fill in the details below to create your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Full Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs text-white">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Abhi Solanki"
                className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600"
              />
            </div>

            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600"
              />
            </div>

            {/* Username */}
            <div className="space-y-3">
              <Label htmlFor="username" className="text-xs text-white">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="username"
                className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600"
                pattern="[a-z0-9_-]{3,30}"
                title="Username must be 3-30 characters and can only contain lowercase letters, numbers, hyphens, and underscores"
              />
              <p className="text-xs text-neutral-500">
                www.croodle.com/<span className="text-neutral-400">{formData.username || 'username'}</span>
              </p>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-xs text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="•••••••••••••••••••"
                  className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600 pr-10"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Minimum 8 characters.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-white text-black hover:bg-neutral-100 font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Already have account */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <p className="text-xs text-white">
              Already have an account?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="h-9 text-neutral-300 hover:text-white hover:bg-transparent"
            >
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
