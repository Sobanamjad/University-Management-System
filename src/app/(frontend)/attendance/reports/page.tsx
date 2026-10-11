'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { generateAttendanceReportPDF } from '@/utils/pdfGenerator'

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  leave: number
  excused: number
  percentage: number
}

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    excused: 0,
    percentage: 0,
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const where: any = { and: [] }

      if (selectedDate) {
        where.and.push({ date: { equals: selectedDate } })
      }

      if (selectedClass) {
        where.and.push({ class: { equals: selectedClass } })
      }

      const query = new URLSearchParams({
        limit: '1000',
        depth: '2',
        ...(where.and.length > 0 && { where: JSON.stringify(where) }),
      })

      const res = await fetch(`/api/attendance?${query}`)
      const data = await res.json()
      const attendance = data.docs || []

      setAttendanceData(attendance)

      const total = attendance.length
      const present = attendance.filter((a: any) => a.status === 'present').length
      const absent = attendance.filter((a: any) => a.status === 'absent').length
      const late = attendance.filter((a: any) => a.status === 'late').length
      const leave = attendance.filter((a: any) => a.status === 'leave').length
      const excused = attendance.filter((a: any) => a.status === 'excused').length

      const percentage = total > 0 ? Math.round((present / total) * 100) : 0

      setStats({
        total,
        present,
        absent,
        late,
        leave,
        excused,
        percentage,
      })
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedClass])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const statCards = [
    {
      label: 'Total Records',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Present',
      value: stats.present,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Absent',
      value: stats.absent,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Late',
      value: stats.late,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Leave',
      value: stats.leave,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Excused',
      value: stats.excused,
      icon: TrendingUp,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Attendance Reports
            </h1>
            <p className="text-sm font-medium text-gray-500">Attendance statistics and summaries</p>
          </div>
          <button
            onClick={() => generateAttendanceReportPDF(attendanceData, stats)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md shadow-blue-100"
          >
            <Download size={20} />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter class ID..."
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <card.icon size={24} className={card.textColor} />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                  </div>
                  <h3 className="text-gray-600 font-medium">{card.label}</h3>
                </div>
              ))}
            </div>

            {/* Attendance Percentage */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Attendance Rate</h3>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-4xl font-bold text-gray-900">{stats.percentage}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.percentage >= 75
                  ? 'Good attendance rate'
                  : stats.percentage >= 60
                    ? 'Moderate attendance rate'
                    : 'Low attendance rate - needs attention'}
              </p>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Present', count: stats.present, color: 'bg-green-500' },
                  { label: 'Absent', count: stats.absent, color: 'bg-red-500' },
                  { label: 'Late', count: stats.late, color: 'bg-yellow-500' },
                  { label: 'Leave', count: stats.leave, color: 'bg-purple-500' },
                  { label: 'Excused', count: stats.excused, color: 'bg-gray-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.count} (
                        {stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{
                          width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
