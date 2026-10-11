'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, UserCheck } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS = {
  present: 'bg-green-100 text-green-700 border-green-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  late: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  leave: 'bg-blue-100 text-blue-700 border-blue-200',
  excused: 'bg-gray-100 text-gray-700 border-gray-200',
}

interface AttendanceRecord {
  id: string
  student?: { displayTitle?: string }
  class?: { title?: string }
  date?: string
  status?: string
  markedBy?: { name?: string }
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const where: any = { and: [] }

      if (statusFilter !== 'all') {
        where.and.push({ status: { equals: statusFilter } })
      }

      if (search) {
        where.and.push({ displayTitle: { contains: search } })
      }

      const query = new URLSearchParams({
        limit: '100',
        depth: '2',
        ...(where.and.length > 0 && { where: JSON.stringify(where) }),
      })

      const res = await fetch(`/api/attendance?${query}`)
      const data = await res.json()
      setAttendance(data.docs || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Attendance</h1>
              <p className="text-sm font-medium text-gray-500">Student Attendance Records</p>
            </div>
          </div>

          <Link
            href="/attendance/create"
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md shadow-blue-100"
          >
            <Plus size={20} />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-4 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by student or class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">Leave</option>
              <option value="excused">Excused</option>
            </select>
          </div>
        </div>

        {/* Attendance List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading attendance data...</p>
          </div>
        ) : attendance.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {record.student?.displayTitle || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.class?.title || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{record.date || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          STATUS_COLORS[record.status as keyof typeof STATUS_COLORS] ||
                          'bg-gray-100'
                        }`}
                      >
                        {record.status
                          ? record.status.charAt(0).toUpperCase() + record.status.slice(1)
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.markedBy?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Attendance Records Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We couldn&apos;t find any attendance records matching your current filter criteria.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
