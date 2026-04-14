// src/app/(frontend)/departments/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Layers, Edit, Activity, Hash } from 'lucide-react'

export default function ViewDepartmentPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [department, setDepartment] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await fetch(`/api/departments/${id}`)
        if (res.ok) {
          const data = await res.json()
          setDepartment(data)
        } else {
          setError('Failed to fetch department details.')
        }
      } catch (err) {
        setError('An error occurred while fetching the department.')
      } finally {
        setFetching(false)
      }
    }
    fetchDepartment()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/departments"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {fetching ? 'Loading...' : department?.name || 'Department Details'}
              </h1>
              <p className="text-sm text-gray-600">View department profile</p>
            </div>
          </div>
          {!fetching && department && (
            <Link
              href={`/departments/edit/${department.id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit size={18} />
              <span>Edit Department</span>
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
                      <h2 className="text-2xl font-bold text-gray-900">{department.name}</h2>
                      <div className="flex items-center mt-2 space-x-4">
                        {department.code && (
                          <span className="text-sm text-gray-500 font-medium">
                            Dept Code: {department.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <Hash className="w-4 h-4 mr-2" />
                        Department ID
                      </h3>
                      <p className="text-gray-900 font-medium font-mono text-sm">{department.id}</p>
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
                        {new Date(department.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(department.updatedAt).toLocaleDateString()}
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
