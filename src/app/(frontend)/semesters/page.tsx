// src/app/(frontend)/semesters/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { stringify } from 'qs'
import type { Where } from 'payload'
import {
  Plus,
  Search,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [advanceMsg, setAdvanceMsg] = useState<{
    id: string
    msg: string
    type: 'success' | 'error'
  } | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    fetchSemesters()
  }, [page, debouncedSearch, statusFilter])

  const fetchSemesters = async () => {
    setLoading(true)
    try {
      const conditions: Where[] = []
      if (debouncedSearch) conditions.push({ name: { contains: debouncedSearch } })
      if (statusFilter !== 'all') conditions.push({ status: { equals: statusFilter } })

      const where: Where | undefined = conditions.length > 1 ? { and: conditions } : conditions[0]

      const queryString = stringify(
        { page, limit: 12, depth: 2, ...(where && { where }) },
        { addQueryPrefix: true },
      )

      const res = await fetch(`/api/semesters${queryString}`)
      const data = await res.json()
      setSemesters(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching semesters:', error)
    } finally {
      setLoading(false)
    }
  }

  // Complete current semester & advance the linked batch
  const handleAdvance = async (semester: any) => {
    const batchObj = semester.batch
    if (!batchObj) {
      setAdvanceMsg({ id: semester.id, msg: 'No batch linked to this semester.', type: 'error' })
      setTimeout(() => setAdvanceMsg(null), 3000)
      return
    }

    const batchId = typeof batchObj === 'object' ? batchObj.id : batchObj
    const nextSem = (batchObj?.currentSemesterNumber || 1) + 1
    const total = parseInt(batchObj?.totalSemesters || '8', 10)

    if (nextSem > total) {
      setAdvanceMsg({ id: semester.id, msg: `All ${total} semesters completed!`, type: 'error' })
      setTimeout(() => setAdvanceMsg(null), 3000)
      return
    }

    setAdvancing(semester.id)
    try {
      // Mark this semester inactive
      await fetch(`/api/semesters/${semester.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })

      // Advance the batch's current semester number
      await fetch(`/api/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSemesterNumber: nextSem,
          ...(nextSem >= total ? { status: 'completed' } : {}),
        }),
      })

      setAdvanceMsg({
        id: semester.id,
        msg: `Batch advanced to Semester ${nextSem}!`,
        type: 'success',
      })
      fetchSemesters()
      setTimeout(() => setAdvanceMsg(null), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setAdvancing(null)
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Semesters</h1>
                <p className="text-sm text-gray-600">Manage university semesters</p>
              </div>
            </div>
            <Link
              href="/semesters/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Semester</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search semesters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {semesters.map((semester: any) => (
                <div
                  key={semester.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{semester.name}</h3>
                          <p className="text-sm text-gray-500">Code: {semester.code || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Session:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {semester.session}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Semester:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {semester.semesterNumber === '1'
                            ? '1st'
                            : semester.semesterNumber === '2'
                              ? '2nd'
                              : semester.semesterNumber === '3'
                                ? '3rd'
                                : `${semester.semesterNumber}th`}{' '}
                          Semester
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {semester.department?.name || 'N/A'}
                        </span>
                      </div>
                      {semester.batch?.name && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Batch:</span>
                          <Link
                            href={`/batches/${semester.batch.id}`}
                            className="text-sm font-medium text-indigo-600 hover:underline"
                          >
                            {semester.batch.name}
                          </Link>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(semester.startDate).toLocaleDateString()} -{' '}
                          {new Date(semester.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Advance message */}
                    {advanceMsg?.id === semester.id && (
                      <div
                        className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium ${
                          advanceMsg?.type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {advanceMsg?.msg}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(semester.status)}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(semester.status)}`}
                        >
                          {semester.status}
                        </span>
                        {semester.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Complete & Advance — only for active semesters linked to a batch */}
                        {semester.isActive && semester.batch && (
                          <button
                            onClick={() => handleAdvance(semester)}
                            disabled={advancing === semester.id}
                            title="Complete this semester & advance batch to next"
                            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            {advancing === semester.id ? (
                              <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ArrowRight size={12} />
                            )}
                            <span>Advance</span>
                          </button>
                        )}
                        <Link
                          href={`/semesters/${semester.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/semesters/edit/${semester.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {semesters.length === 0 && (
                <div className="md:col-span-3 bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No semesters found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or create a new semester.
                  </p>
                  <Link
                    href="/semesters/create"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    <span>Add Semester</span>
                  </Link>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
