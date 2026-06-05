// src/app/(frontend)/dashboard/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  UserCheck,
  GraduationCap,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState({
    departments: 0,
    users: 0,
    students: 0,
    teachers: 0,
    coordinators: 0,
    semesters: 0,
    courses: 0,
    classes: 0,
    enrollments: 0,
  })

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          fetchStats()
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchStats = async () => {
    try {
      const [departments, users, students, semesters, courses, classes, enrollments] =
        await Promise.all([
          fetch('/api/departments?limit=0').then((res) => res.json()),
          fetch('/api/users?limit=0').then((res) => res.json()),
          fetch('/api/students?limit=0').then((res) => res.json()),
          fetch('/api/semesters?limit=0').then((res) => res.json()),
          fetch('/api/courses?limit=0').then((res) => res.json()),
          fetch('/api/classes?limit=0').then((res) => res.json()),
          fetch('/api/enrollments?limit=0').then((res) => res.json()),
        ])

      const teachers = users.docs.filter((u: any) => u.role === 'teacher').length
      const coordinators = users.docs.filter((u: any) => u.role === 'coordinator').length

      setStats({
        departments: departments.totalDocs || 0,
        users: users.totalDocs || 0,
        students: students.totalDocs || 0,
        teachers,
        coordinators,
        semesters: semesters.totalDocs || 0,
        courses: courses.totalDocs || 0,
        classes: classes.totalDocs || 0,
        enrollments: enrollments.totalDocs || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'coordinator':
        return 'bg-blue-100 text-blue-700'
      case 'teacher':
        return 'bg-green-100 text-green-700'
      case 'student':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>

            <div className="flex items-center space-x-6">
              {/* Date */}
              <div className="hidden md:block text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              {/* Profile Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {getInitials(user?.name || 'User')}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* User Info (Hidden on mobile) */}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>

                  <ChevronDown
                    className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
                          user?.role,
                        )}`}
                      >
                        {user?.role}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Your Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid - Same as before */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Departments Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.departments}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Departments</h3>
            <p className="text-sm text-gray-500 mt-1">Academic departments</p>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.users}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Users</h3>
            <p className="text-sm text-gray-500 mt-1">
              Teachers: {stats.teachers} | Coordinators: {stats.coordinators}
            </p>
          </div>

          {/* Students Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.students}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Students</h3>
            <p className="text-sm text-gray-500 mt-1">Enrolled students</p>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Semesters Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.semesters}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Semesters</h3>
            <p className="text-sm text-gray-500 mt-1">Academic semesters</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.courses}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Courses</h3>
            <p className="text-sm text-gray-500 mt-1">Active courses</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.classes}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Classes</h3>
            <p className="text-sm text-gray-500 mt-1">Scheduled classes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.enrollments}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Enrollments</h3>
            <p className="text-sm text-gray-500 mt-1">Student enrollments</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/collections/students/create"
              className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
            >
              Add Student
            </Link>
            <Link
              href="/admin/collections/courses/create"
              className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-center font-medium"
            >
              Add Course
            </Link>
            <Link
              href="/admin/collections/classes/create"
              className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-center font-medium"
            >
              Create Class
            </Link>
            <Link
              href="/enrollments/create"
              className="p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-center font-medium"
            >
              New Enrollment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
