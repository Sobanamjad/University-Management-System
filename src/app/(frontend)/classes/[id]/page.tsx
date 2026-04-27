// src/app/(frontend)/classes/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  MapPin,
  Users,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  Building2,
  Hash,
} from 'lucide-react'

export default function ClassViewPage() {
  const { id } = useParams()
  const [classData, setClassData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/classes/${id}?depth=2`)
        if (res.ok) {
          const data = await res.json()
          setClassData(data)
        } else {
          setError('Class not found')
        }
      } catch (err) {
        setError('An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchClass()
  }, [id])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          icon: Clock,
          color: 'yellow',
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          label: 'Scheduled',
        }
      case 'ongoing':
        return {
          icon: CheckCircle,
          color: 'green',
          bg: 'bg-green-100',
          text: 'text-green-700',
          label: 'Ongoing',
        }
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'blue',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          label: 'Completed',
        }
      default:
        return {
          icon: XCircle,
          color: 'red',
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: status,
        }
    }
  }

  const getDayColor = (day: string) => {
    const colors: any = {
      monday: 'bg-blue-100 text-blue-700',
      tuesday: 'bg-green-100 text-green-700',
      wednesday: 'bg-purple-100 text-purple-700',
      thursday: 'bg-orange-100 text-orange-700',
      friday: 'bg-pink-100 text-pink-700',
      saturday: 'bg-indigo-100 text-indigo-700',
    }
    return colors[day] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-8">{error || 'Class not found'}</p>
          <Link
            href="/classes"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Back to Classes
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(classData.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 flex items-center shadow-sm">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/classes" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {classData.title || `${classData.course?.code} - Section ${classData.section}`}
              </h1>
              <p className="text-xs text-gray-500">Class Details</p>
            </div>
          </div>
          <Link
            href={`/classes/edit/${classData.id}`}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            <Edit size={18} />
            <span>Edit Class</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Status</span>
              <div className={`p-2 rounded-xl ${statusConfig.bg}`}>
                <statusConfig.icon size={20} className={statusConfig.text} />
              </div>
            </div>
            <p className={`text-xl font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Enrollment</span>
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {classData.currentStudents || 0}{' '}
              <span className="text-sm font-normal text-gray-500">
                / {classData.maxStudents || 0}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Students enrolled</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Lecture Type</span>
              <div className="p-2 bg-purple-100 rounded-xl">
                <GraduationCap size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 capitalize">{classData.lectureType}</p>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-gray-900">Class Information</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <Hash size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{classData.section}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <BookOpen size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{classData.course?.title}</p>
                    <p className="text-sm text-gray-500">Code: {classData.course?.code}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{classData.teacher?.name}</p>
                    <p className="text-sm text-gray-500">{classData.teacher?.email}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <Building2 size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {classData.department?.name}
                    </p>
                    <p className="text-sm text-gray-500">Code: {classData.department?.code}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <Calendar size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {classData.semester?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Days
                </p>
                <div className="flex flex-wrap gap-2">
                  {classData.days?.map((day: string) => (
                    <span
                      key={day}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getDayColor(day)}`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Time Slot
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  <span className="text-gray-900 font-medium">{classData.timeSlot}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info (if exists) */}
        {classData.room && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
            </div>
            <div className="p-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <MapPin size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="text-xl font-bold text-gray-900">{classData.room}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
