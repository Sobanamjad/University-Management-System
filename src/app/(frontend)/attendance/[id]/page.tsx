'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck } from 'lucide-react'

const STATUS_COLORS = {
  present: 'bg-green-100 text-green-700 border-green-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  late: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  leave: 'bg-blue-100 text-blue-700 border-blue-200',
  excused: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function AttendanceDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [attendance, setAttendance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/attendance/${id}?depth=2`)
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!attendance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Attendance record not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center">
          <Link href="/attendance" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 ml-4">Attendance Details</h1>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 uppercase tracking-wider">Student</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {attendance.student?.displayTitle || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 uppercase tracking-wider">Class</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {attendance.class?.title || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 uppercase tracking-wider">Date</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{attendance.date || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 uppercase tracking-wider">Status</label>
              <p className="mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    STATUS_COLORS[attendance.status as keyof typeof STATUS_COLORS] || 'bg-gray-100'
                  }`}
                >
                  {attendance.status?.charAt(0).toUpperCase() + attendance.status?.slice(1)}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 uppercase tracking-wider">Marked By</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {attendance.markedBy?.name || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 uppercase tracking-wider">Semester</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {attendance.semester?.name || 'N/A'}
              </p>
            </div>
          </div>

          {attendance.remarks && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="text-sm text-gray-500 uppercase tracking-wider">Remarks</label>
              <p className="text-gray-700 mt-1">{attendance.remarks}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
            <Link
              href="/attendance"
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
