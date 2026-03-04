// src/app/(frontend)/register/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    dateOfBirth: '',
    gender: '',
    cnic: '',
    street: '',
    city: '',
    state: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Refs for animations
  const containerRef = useRef(null)
  const formRef = useRef(null)
  const stepRef = useRef(null)
  const fieldsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
    )

    // Animate progress bar
    gsap.to('.progress-bar', {
      width: `${step * 33.33}%`,
      duration: 0.5,
      ease: 'power2.out',
    })
  }, [step])

  const animateStepTransition = (direction: 'next' | 'prev') => {
    gsap.to(formRef.current, {
      x: direction === 'next' ? -50 : 50,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setStep(direction === 'next' ? step + 1 : step - 1)
        gsap.fromTo(
          formRef.current,
          { x: direction === 'next' ? 50 : -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5 },
        )
      },
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    // Input field animation
    gsap.to(e.target, {
      scale: 1.02,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step < 3) {
      animateStepTransition('next')
      return
    }

    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      // Shake animation
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
      })
      return
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: 'active',
          personalInfo: {
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            cnic: formData.cnic,
          },
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
          },
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Success animation
        gsap.to(formRef.current, {
          scale: 1.1,
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            router.push('/login?registered=true')
          },
        })
      } else {
        setError(data.errors?.[0]?.message || 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4"
    >
      {/* Main Container */}
      <div className="relative w-full max-w-2xl">
        {/* Progress Bar */}
        <div ref={stepRef} className="mb-8">
          <div className="flex justify-between mb-2">
            {['Account', 'Personal', 'Address'].map((label, i) => (
              <div
                key={i}
                className={`text-sm font-medium transition-colors duration-300 ${
                  step > i + 1 ? 'text-green-400' : step === i + 1 ? 'text-white' : 'text-white/40'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="progress-bar h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-0"></div>
          </div>
        </div>

        {/* Form Card */}
        <div
          ref={formRef}
          className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-2">Create Account</h2>
          <p className="text-white/60 text-center mb-8">Join our academic community</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-white text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div
                  ref={(el) => {
                    fieldsRef.current[0] = el
                  }}
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div
                  ref={(el) => {
                    fieldsRef.current[1] = el
                  }}
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    ref={(el) => {
                      fieldsRef.current[2] = el
                    }}
                  >
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div
                    ref={(el) => {
                      fieldsRef.current[3] = el
                    }}
                  >
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div
                  ref={(el) => {
                    fieldsRef.current[4] = el
                  }}
                >
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="student" className="bg-gray-800">
                      Student
                    </option>
                    <option value="teacher" className="bg-gray-800">
                      Teacher
                    </option>
                    <option value="coordinator" className="bg-gray-800">
                      Coordinator
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <select
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    >
                      <option value="" className="bg-gray-800">
                        Select Gender
                      </option>
                      <option value="male" className="bg-gray-800">
                        Male
                      </option>
                      <option value="female" className="bg-gray-800">
                        Female
                      </option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="cnic"
                      placeholder="CNIC (36300-5419772-3)"
                      required
                      value={formData.cnic}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => animateStepTransition('prev')}
                  className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : step === 3 ? 'Create Account' : 'Next Step'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/60">
                Already have an account?{' '}
                <Link href="/login" className="text-white font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
