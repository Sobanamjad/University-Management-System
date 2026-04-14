// src/app/(frontend)/login/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const fieldsRef = useRef<(HTMLDivElement | null)[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const linkRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 })
      .fromTo(
        titleRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.6',
      )
      .fromTo(
        subtitleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.5',
      )
      .fromTo(
        fieldsRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.12 },
        '-=0.4',
      )
      .fromTo(
        buttonRef.current,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' },
        '-=0.3',
      )
      .fromTo(linkRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')

    // Gentle floating background elements
    gsap.to('.floating-shape', {
      y: 'random(-15, 15)',
      x: 'random(-15, 15)',
      rotation: 'random(-5, 5)',
      duration: 'random(8, 14)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: { amount: 0.6 },
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    gsap.to(buttonRef.current, {
      scale: 0.96,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
    })

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        gsap.to(formRef.current, {
          scale: 1.03,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          onComplete: () => router.push('/dashboard'),
        })
      } else {
        setError(data.errors?.[0]?.message || 'Invalid credentials')
        gsap.to(formRef.current, {
          x: [-8, 8, -8, 8, 0],
          duration: 0.35,
          ease: 'power2.out',
        })
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-shape absolute -left-20 top-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="floating-shape absolute -right-32 bottom-10 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="floating-shape absolute left-1/3 top-1/2 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-3xl -translate-x-1/2"></div>
      </div>

      <div ref={formRef} className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl p-9 border border-white/10 ring-1 ring-white/5">
          <div className="text-center mb-10">
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
            >
              Welcome Back
            </h1>
            <p ref={subtitleRef} className="mt-3 text-lg text-white/60">
              Sign in to continue
            </p>
          </div>

          {error && (
            <div className="mb-7 p-4 bg-red-900/30 border border-red-500/40 rounded-2xl text-center text-red-200 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div
              ref={(el) => {
                fieldsRef.current[0] = el
              }}
              className="group relative"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-5 py-4 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-blue-400/60 transition-all duration-300"
                placeholder="Email address"
              />
              <label className="absolute left-5 -top-2.5 px-2 bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 text-white/70 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-300">
                Email address
              </label>
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 text-xl">
                ✉️
              </span>
            </div>

            <div
              ref={(el) => {
                fieldsRef.current[1] = el
              }}
              className="group relative"
            >
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full px-5 py-4 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-purple-400/60 transition-all duration-300"
                placeholder="Password"
              />
              <label className="absolute left-5 -top-2.5 px-2 bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 text-white/70 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-300">
                Password
              </label>
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 text-xl">
                🔒
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2.5 text-white/70">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/30 bg-white/5 text-purple-500 focus:ring-purple-500/40"
                />
                Remember me
              </label>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>
          <div ref={linkRef} className="mt-8 text-center text-white/60 text-sm">
            Don’t have an account?{' '}
            <Link
              href="/register"
              className="text-white font-medium hover:text-purple-300 transition-colors"
            >
              Create one
            </Link>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-4 bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 text-white/40">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {['Google', 'Facebook', 'Twitter'].map((name, i) => (
                <button
                  key={i}
                  disabled
                  className="py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-white/70 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
