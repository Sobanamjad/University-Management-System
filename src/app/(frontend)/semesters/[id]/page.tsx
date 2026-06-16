// src/app/(frontend)/semesters/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Activity,
  Hash,
  Building2,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export default function ViewSemesterPage() {
  const { id } = useParams()
  const [semester, setSemester] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const res = await fetch(`/api/semesters/${id}?depth=1`)
        if (res.ok) {
          const data = await res.json()
          setSemester(data)
        } else {
          setError('Failed to fetch semester details.')
        }
      } catch (err) {
        setError('An error occurred while fetching the semester.')
      } finally {
        setFetching(false)
      }
    }
    fetchSemester()
  }, [id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Clock className="w-4 h-4 text-green-500" />
      case 'upcoming':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-700'
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
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
              href="/semesters"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {fetching ? 'Loading...' : semester?.name || 'Semester Details'}
              </h1>
              <p className="text-sm text-gray-600">View university semester profile</p>
            </div>
          </div>
          {!fetching && semester && (
            <Link
              href={`/semesters/edit/${semester.id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit size={18} />
              <span>Edit Semester</span>
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
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column (Main Info) */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{semester.name}</h2>
                      <div className="flex items-center mt-2 space-x-4">
                        <span
                          className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(semester.status)}`}
                        >
                          {getStatusIcon(semester.status)}
                          <span>
                            {semester.status.charAt(0).toUpperCase() + semester.status.slice(1)}
                          </span>
                        </span>
                        {semester.isActive && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Current Active Semester
                          </span>
                        )}
                        {semester.code && (
                          <span className="text-sm text-gray-500 font-medium border-l pl-4 border-gray-300">
                            Code: {semester.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Layers className="w-4 h-4 mr-2" />
                        Department
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {semester.department?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        Duration
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {new Date(semester.startDate).toLocaleDateString()} &mdash;{' '}
                        {new Date(semester.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Hash className="w-4 h-4 mr-2" />
                        Session / Number
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {semester.session} (Semester {semester.semesterNumber})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Side Info) */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center text-blue-600">
                    <Activity className="w-5 h-5 mr-2" />
                    System Data
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Semester ID</span>
                      <span className="text-sm font-medium font-mono text-gray-900">
                        {semester.id}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Created At</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(semester.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(semester.updatedAt).toLocaleDateString()}
                      </span>
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
