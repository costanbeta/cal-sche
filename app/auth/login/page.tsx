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

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsVerification) {
          sessionStorage.setItem('verificationEmail', formData.email)
          router.push('/auth/verify-email-pending')
          return
        }
        throw new Error(data.error || 'Failed to login')
      }

      router.push('/dashboard')
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[350px] space-y-6">
          {/* Form Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-neutral-400">
              Sign In to your Croodle account
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-white text-black hover:bg-neutral-100 font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Don't have account */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <p className="text-xs text-white">
              Don&apos;t have an account?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="h-9 text-neutral-300 hover:text-white hover:bg-transparent"
            >
              <Link href="/auth/signup">
                <LogIn className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>

          {/* Forgot Password */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <p className="text-xs text-white">
              Don&apos;t remember password?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="h-9 text-neutral-300 hover:text-white hover:bg-transparent"
            >
              <Link href="/auth/forgot-password">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Forgot Password
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
