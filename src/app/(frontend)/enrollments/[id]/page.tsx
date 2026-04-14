// src/app/(frontend)/enrollments/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  UserCheck,
  Edit,
  Activity,
  Hash,
  Building2,
  Layers,
  Clock,
  GraduationCap,
  Calendar,
} from 'lucide-react'

export default function ViewEnrollmentPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [enrollment, setEnrollment] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const res = await fetch(`/api/enrollments/${id}?depth=2`)
        if (res.ok) {
          const data = await res.json()
          setEnrollment(data)
        } else {
          setError('Failed to fetch enrollment details.')
        }
      } catch (err) {
        setError('An error occurred while fetching the enrollment.')
      } finally {
        setFetching(false)
      }
    }
    fetchEnrollment()
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-blue-100 text-blue-700'
      case 'dropped':
        return 'bg-red-100 text-red-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/enrollments"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {fetching ? 'Loading...' : `Enrollment Details`}
              </h1>
              <p className="text-sm text-gray-600">Student registration record</p>
            </div>
          </div>
          {!fetching && enrollment && (
            <Link
              href={`/enrollments/edit/${enrollment.id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit size={18} />
              <span>Update Status</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-4xl mt-6">
          {fetching ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center text-red-600 font-medium">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column (Main Info) */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {enrollment.student?.displayTitle || enrollment.student?.id}
                        </h2>
                        <span
                          className={`inline-flex items-center mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(enrollment.status)}`}
                        >
                          {enrollment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 flex items-center mb-3">
                        <Clock className="w-4 h-4 mr-2" />
                        Class Information
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-900 font-bold text-lg">{enrollment.class?.title}</p>
                        <p className="text-sm text-gray-600">
                          {enrollment.class?.timeSlot} | {enrollment.class?.room}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 flex items-center mb-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        Semester
                      </h3>
                      <p className="text-gray-900 font-bold">{enrollment.semester?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{enrollment.semester?.session}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 flex items-center mb-3">
                        <Building2 className="w-4 h-4 mr-2" />
                        Campus
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {enrollment.university?.name || enrollment.student?.university?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 flex items-center mb-3">
                        <Layers className="w-4 h-4 mr-2" />
                        Department
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {enrollment.department?.name || enrollment.student?.department?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Side Info) */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center text-blue-600 border-b border-gray-50 pb-4">
                    <Activity className="w-5 h-5 mr-2" />
                    Record Audit
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">
                        Enrollment ID
                      </span>
                      <span className="text-sm font-medium font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 block truncate">
                        {enrollment.id}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">
                        Registered On
                      </span>
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {new Date(enrollment.createdAt).toLocaleDateString('en-US', {
                          dateStyle: 'long',
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">
                        Last Update
                      </span>
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        {new Date(enrollment.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
