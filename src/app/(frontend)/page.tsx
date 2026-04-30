'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import {
  GraduationCap,
  Building2,
  Layers,
  Users,
  Calendar,
  BookOpen,
  Clock,
  UserCheck,
  BookMarked,
  Banknote,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Universities',
    description: 'Manage university profiles, campuses, and institutional data in one place.',
    href: '/universities',
    color: 'blue',
  },
  {
    icon: Layers,
    title: 'Departments',
    description: 'Organize academic departments, assign heads, and track programs.',
    href: '/departments',
    color: 'green',
  },
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Maintain student records, admissions, and academic progress.',
    href: '/students',
    color: 'orange',
  },
  {
    icon: Users,
    title: 'Users & Staff',
    description: 'Handle teachers, coordinators, and administrative staff accounts.',
    href: '/users',
    color: 'purple',
  },
  {
    icon: Calendar,
    title: 'Semesters',
    description: 'Configure academic semesters, dates, and session schedules.',
    href: '/semesters',
    color: 'pink',
  },
  {
    icon: BookOpen,
    title: 'Courses',
    description: 'Create and manage course catalogs, prerequisites, and credit hours.',
    href: '/courses',
    color: 'indigo',
  },
  {
    icon: Clock,
    title: 'Classes',
    description: 'Schedule classes, assign rooms, and manage section capacity.',
    href: '/classes',
    color: 'red',
  },
  {
    icon: UserCheck,
    title: 'Enrollments',
    description: 'Process student enrollments, drops, and waitlist management.',
    href: '/enrollments',
    color: 'teal',
  },
  {
    icon: BookMarked,
    title: 'Timetable',
    description: 'Generate and view timetables for classes and instructors.',
    href: '/timetable',
    color: 'cyan',
  },
  {
    icon: Banknote,
    title: 'Teacher Salary',
    description: 'Track salary records, payments, and compensation details.',
    href: '/teacher-salary',
    color: 'emerald',
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
}

export default function HomePage() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
  const sectionTitleRef = useRef<HTMLHeadingElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .fromTo(
        titleRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.4',
      )
      .fromTo(
        subtitleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4',
      )
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
      .fromTo(scrollIndicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2')

    gsap.to(scrollIndicatorRef.current, {
      y: 8,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    if (sectionTitleRef.current) {
      gsap.fromTo(
        sectionTitleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: sectionTitleRef.current,
          delay: 1,
        },
      )
    }

    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 1.2,
        },
      )
    }

    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: 1.3 + index * 0.08,
            ease: 'power2.out',
          },
        )
      }
    })

    gsap.to('.floating-orb', {
      y: 'random(-20, 20)',
      x: 'random(-20, 20)',
      rotation: 'random(-8, 8)',
      duration: 'random(8, 14)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: { amount: 1 },
    })
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 overflow-hidden px-6"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="floating-orb absolute -left-32 top-16 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="floating-orb absolute -right-40 bottom-20 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="floating-orb absolute left-1/3 top-1/2 w-[350px] h-[350px] bg-pink-600/8 rounded-full blur-3xl -translate-x-1/2"></div>
          <div className="floating-orb absolute right-1/4 top-1/4 w-[250px] h-[250px] bg-indigo-400/8 rounded-full blur-3xl"></div>
        </div>

        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UMS</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-white/80 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white text-indigo-950 rounded-xl hover:bg-white/90 transition-all duration-300 font-medium"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/70 text-sm font-medium">University Management System</span>
          </div>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight"
          >
            Manage Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              University
            </span>{' '}
            Seamlessly
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            {user
              ? `Welcome back, ${user.name || user.email}. Access your dashboard to manage universities, students, courses, and more.`
              : 'A comprehensive platform to manage universities, departments, students, courses, enrollments, timetables, and everything in between.'}
          </p>

          <div
            ref={ctaRef}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="group flex items-center space-x-3 px-8 py-4 bg-white text-indigo-950 rounded-2xl hover:bg-white/90 transition-all duration-300 font-semibold text-lg shadow-lg shadow-white/10"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="group flex items-center space-x-3 px-8 py-4 bg-white text-indigo-950 rounded-2xl hover:bg-white/90 transition-all duration-300 font-semibold text-lg shadow-lg shadow-white/10"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-3 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 font-semibold text-lg"
                >
                  <span>Create Account</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/40"
        >
          <span className="text-xs font-medium mb-2">Explore Modules</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Stats Bar */}
      <div ref={statsRef} className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { label: 'Modules', value: '10+' },
              { label: 'Role-Based Access', value: 'RBAC' },
              { label: 'Real-Time', value: 'Live Data' },
              { label: 'Admin Panel', value: 'Built-In' },
              { label: 'API Ready', value: 'REST + GraphQL' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 ref={sectionTitleRef} className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              Manage every aspect of your university with dedicated modules designed for efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {features.map((feature, index) => {
              const colors = colorMap[feature.color]
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  ref={(el) => {
                    cardsRef.current[index] = el
                  }}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-fuchsia-950 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/60 text-lg mb-8">
            {user
              ? 'Head to the dashboard to manage your university.'
              : 'Sign in to start managing your university today.'}
          </p>
          <Link
            href={user ? '/dashboard' : '/login'}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-indigo-950 rounded-2xl hover:bg-white/90 transition-all duration-300 font-semibold text-lg"
          >
            <span>{user ? 'Go to Dashboard' : 'Sign In Now'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <GraduationCap className="w-4 h-4" />
            <span>University Management System</span>
          </div>
          <div className="flex items-center space-x-6">
            {/* <Link href="/admin" className="hover:text-gray-300 transition-colors">
              Admin Panel
            </Link> */}
            {/* <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Dashboard
            </Link> */}
          </div>
        </div>
      </footer>
    </div>
  )
}
