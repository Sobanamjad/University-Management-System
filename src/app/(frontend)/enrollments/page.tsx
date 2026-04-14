// src/app/(frontend)/enrollments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  Layers,
  GraduationCap,
  Clock,
} from 'lucide-react'

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchEnrollments()
  }, [page, search, statusFilter])

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        depth: '2',
        ...(statusFilter !== 'all' && { where: { status: { equals: statusFilter } } }),
        // Searching by student name via nested query if supported, or just filtering by status
      })

      const res = await fetch(`/api/enrollments?${query}`)
      const data = await res.json()
      setEnrollments(data.docs)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this enrollment? This will also affect the class capacity count.')) {
      try {
        await fetch(`/api/enrollments/${id}`, { method: 'DELETE' })
        fetchEnrollments()
      } catch (error) {
        console.error('Error deleting enrollment:', error)
      }
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
                <p className="text-sm text-gray-600">Manage student class registrations</p>
              </div>
            </div>
            <Link
              href="/enrollments/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus size={20} />
              <span>New Enrollment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Filter by student or class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="dropped">Dropped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {enrollments.map((enr: any) => (
                <div
                  key={enr.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                    {/* Student Info */}
                    <div className="flex items-center space-x-4 min-w-[200px]">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {enr.student?.displayTitle || enr.student?.id || 'Unknown Student'}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Layers size={12} className="mr-1" />
                          {enr.student?.department?.name || 'N/A'}
                        </p>
                        <p className="text-[10px] text-blue-500 font-medium mt-0.5">
                          {enr.semester?.name || 'No Semester'}
                        </p>
                      </div>
                    </div>

                    {/* Class Info */}
                    <div className="flex items-center space-x-4 min-w-[250px]">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                          {enr.class?.title || 'Unknown Class'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {enr.class?.timeSlot} | {enr.class?.room}
                        </p>
                      </div>
                    </div>

                    {/* Status Toggle/Pill */}
                    <div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusColor(
                          enr.status
                        )}`}
                      >
                        {enr.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                    <Link
                      href={`/enrollments/${enr.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/enrollments/edit/${enr.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Enrollment"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(enr.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Enrollment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {enrollments.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No enrollments found</h3>
                  <p className="text-gray-500 mb-6">Start registering students into classes.</p>
                  <Link
                    href="/enrollments/create"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={20} />
                    <span>New Enrollment</span>
                  </Link>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
