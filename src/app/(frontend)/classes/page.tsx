// src/app/(frontend)/classes/page.tsx
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
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Calendar,
  MapPin,
  User,
  BookOpen,
  X,
} from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dayFilter, setDayFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchClasses()
  }, [page, search, dayFilter, statusFilter])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      // Build where conditions
      const conditions: any[] = []

      if (search) {
        conditions.push({
          or: [
            { title: { like: search } },
            { section: { like: search } },
            { 'course.title': { like: search } },
            { 'teacher.name': { like: search } },
          ],
        })
      }

      if (dayFilter !== 'all') {
        conditions.push({ days: { contains: dayFilter } })
      }

      if (statusFilter !== 'all') {
        conditions.push({ status: { equals: statusFilter } })
      }

      const where = conditions.length > 0 ? { and: conditions } : {}

      const query = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        depth: '2',
        ...(Object.keys(where).length && { where: JSON.stringify(where) }),
      })

      const res = await fetch(`/api/classes?${query}`)
      const data = await res.json()
      setClasses(data.docs)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
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

  const clearFilters = () => {
    setSearch('')
    setDayFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                <p className="text-sm text-gray-600">Manage class schedules</p>
              </div>
            </div>
            <Link
              href="/classes/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Class</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by class, course or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Days</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={fetchClasses}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter size={20} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Active Filters Display */}
          {(search || dayFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {search && (
                <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                  Search: {search}
                  <button onClick={() => setSearch('')} className="ml-2 hover:text-blue-900">
                    ×
                  </button>
                </span>
              )}
              {dayFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                  Day: {dayFilter}
                  <button onClick={() => setDayFilter('all')} className="ml-2 hover:text-green-900">
                    ×
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-2 hover:text-yellow-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                <X size={14} className="mr-1" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-4">Try changing your filters or create a new class</p>
            <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls: any) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {cls.title || `${cls.course?.code} - Section ${cls.section}`}
                          </h3>
                          <p className="text-sm text-gray-500">Section {cls.section}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen size={16} className="mr-2" />
                        Course: {cls.course?.title || cls.course?.code || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-2" />
                        Teacher: {cls.teacher?.name || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        Semester: {cls.semester?.name || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-2" />
                        Time: {cls.timeSlot}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {cls.days?.map((day: string) => (
                          <span
                            key={day}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getDayColor(day)}`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            cls.status === 'scheduled'
                              ? 'bg-yellow-100 text-yellow-700'
                              : cls.status === 'ongoing'
                                ? 'bg-green-100 text-green-700'
                                : cls.status === 'completed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {cls.status}
                        </span>
                        <span className="text-sm text-gray-500">{cls.lectureType}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/classes/${cls.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/classes/edit/${cls.id}`}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
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
