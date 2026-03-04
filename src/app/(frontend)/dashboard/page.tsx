// src/app/(frontend)/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  University,
  Layers,
  UserCheck,
  GraduationCap,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    universities: 0,
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

  const fetchStats = async () => {
    try {
      const [universities, departments, users, students, semesters, courses, classes, enrollments] =
        await Promise.all([
          fetch('/api/universities?limit=0').then((res) => res.json()),
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
        universities: universities.totalDocs || 0,
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
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Universities Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <University className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.universities}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Universities</h3>
            <p className="text-sm text-gray-500 mt-1">Total registered universities</p>
          </div>

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

          {/* Courses Card */}
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

          {/* Classes Card */}
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

          {/* Enrollments Card */}
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
              href="/admin/collections/enrollments/create"
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
