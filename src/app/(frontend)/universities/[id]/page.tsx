// src/app/(frontend)/universities/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Edit, Phone, Mail, MapPin, Hash, Activity } from 'lucide-react'

export default function ViewUniversityPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [university, setUniversity] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const res = await fetch(`/api/universities/${id}`)
        if (res.ok) {
          const data = await res.json()
          setUniversity(data)
        } else {
          setError('Failed to fetch university details.')
        }
      } catch (err) {
        setError('An error occurred while fetching the university.')
      } finally {
        setFetching(false)
      }
    }
    fetchUniversity()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/universities"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {fetching ? 'Loading...' : university?.name || 'University Details'}
              </h1>
              <p className="text-sm text-gray-600">View university profile</p>
            </div>
          </div>
          {!fetching && university && (
            <Link
              href={`/universities/edit/${university.id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit size={18} />
              <span>Edit University</span>
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
                      <h2 className="text-2xl font-bold text-gray-900">{university.name}</h2>
                      <div className="flex items-center mt-2 space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            university.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {university.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        {university.code && (
                          <span className="text-sm text-gray-500 font-medium">
                            Code: {university.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location
                      </h3>
                      <p className="text-gray-900 font-medium">{university.city || 'Not provided'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone
                      </h3>
                      <p className="text-gray-900 font-medium">{university.phone || 'Not provided'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </h3>
                      <p className="text-gray-900 font-medium">{university.email || 'Not provided'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Hash className="w-4 h-4 mr-2" />
                        University ID
                      </h3>
                      <p className="text-gray-900 font-medium font-mono text-sm">{university.id}</p>
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
                      <span className="block text-xs text-gray-500 mb-1">Created At</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(university.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(university.updatedAt).toLocaleDateString()}
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
