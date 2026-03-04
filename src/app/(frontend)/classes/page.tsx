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
} from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dayFilter, setDayFilter] = useState('all')

  useEffect(() => {
    fetchClasses()
  }, [page, search, dayFilter])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        depth: '2',
        ...(search && { where: { title: { like: search } } }),
        ...(dayFilter !== 'all' && { where: { days: { contains: dayFilter } } }),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                <p className="text-sm text-gray-600">Manage class schedules</p>
              </div>
            </div>
            <Link
              href="/classes/create"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Days</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Filter size={20} />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
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
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                          <p className="text-sm text-gray-500">Section {cls.section}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen size={16} className="mr-2" />
                        Course: {cls.course?.title || 'N/A'}
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
                        <MapPin size={16} className="mr-2" />
                        Room: {cls.room || 'N/A'} | Time: {cls.timeSlot}
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
                        <span className="text-sm text-gray-500">Type: {cls.lectureType}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/classes/${cls.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/classes/edit/${cls.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50"
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
