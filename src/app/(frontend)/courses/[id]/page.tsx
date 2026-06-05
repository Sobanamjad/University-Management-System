// src/app/(frontend)/courses/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  User,
  GraduationCap,
  Building2,
  Calendar,
  Users,
  Edit,
  CheckCircle,
  AlertCircle,
  Hash,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export default function CourseViewPage() {
  const { id } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}?depth=2`)
        if (res.ok) {
          const data = await res.json()
          setCourse(data)
        } else {
          setError('Course not found')
        }
      } catch (err) {
        setError('An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-8">{error || 'Course not found'}</p>
          <Link
            href="/courses"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 flex items-center shadow-sm">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/courses" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-xs text-gray-500">Course Code: {course.code}</p>
            </div>
          </div>
          <Link
            href={`/courses/edit/${course.id}`}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            <Edit size={18} />
            <span>Edit Course</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Credit Hours</span>
              <div className="p-2 bg-blue-100 rounded-xl">
                <Clock size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{course.creditHours}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Status</span>
              <div
                className={`p-2 rounded-xl ${course.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <CheckCircle
                  size={20}
                  className={course.status === 'active' ? 'text-green-600' : 'text-gray-600'}
                />
              </div>
            </div>
            <p
              className={`text-xl font-bold ${course.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}
            >
              {course.status || 'Active'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Department</span>
              <div className="p-2 bg-purple-100 rounded-xl">
                <Building2 size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{course.department?.name}</p>
            <p className="text-xs text-gray-500">Code: {course.department?.code}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Semester</span>
              <div className="p-2 bg-orange-100 rounded-xl">
                <Calendar size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{course.semester?.name || 'N/A'}</p>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-gray-900">Course Information</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <Hash size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Code
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{course.code}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <BookOpen size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Title
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{course.title}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <Clock size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Hours
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{course.creditHours}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <GraduationCap size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{course.department?.name}</p>
                    <p className="text-sm text-gray-500">Code: {course.department?.code}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Info Card */}
        {course.teacher && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50">
              <h2 className="text-lg font-semibold text-gray-900">Course Teacher</h2>
            </div>
            <div className="p-8">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mr-6">
                  <User size={32} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </p>
                      <p className="text-lg font-semibold text-gray-900">{course.teacher?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-lg font-semibold text-gray-900 flex items-center">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {course.teacher?.email}
                      </p>
                    </div>
                    {course.teacher?.teacherInfo?.designation && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {course.teacher?.teacherInfo?.designation}
                        </p>
                      </div>
                    )}
                    {course.teacher?.teacherInfo?.qualification && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualification
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {course.teacher?.teacherInfo?.qualification}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
