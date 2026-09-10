// src/app/(frontend)/batches/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { stringify } from 'qs-esm'
import type { Where } from 'payload'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  PauseCircle,
} from 'lucide-react'

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [departments, setDepartments] = useState<any[]>([])
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
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
  }, [debouncedSearch, statusFilter, departmentFilter])

  useEffect(() => {
    fetchBatches()
  }, [page, debouncedSearch, statusFilter, departmentFilter])

  useEffect(() => {
    fetch('/api/departments?limit=100')
      .then((r) => r.json())
      .then((d) => setDepartments(d.docs || []))
  }, [])

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const conditions: Where[] = []

      if (debouncedSearch) {
        conditions.push({
          or: [{ name: { contains: debouncedSearch } }, { session: { contains: debouncedSearch } }],
        })
      }

      if (statusFilter !== 'all') conditions.push({ status: { equals: statusFilter } })
      if (departmentFilter !== 'all') conditions.push({ department: { equals: departmentFilter } })

      const where: Where | undefined = conditions.length > 1 ? { and: conditions } : conditions[0]

      const queryString = stringify(
        { page, limit: 12, depth: 2, sort: '-startYear', ...(where && { where }) },
        { addQueryPrefix: true },
      )

      const res = await fetch(`/api/batches${queryString}`)
      const data = await res.json()
      setBatches(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setTotalDocs(data.totalDocs || 0)
    } catch (err) {
      console.error('Error fetching batches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchBatches()
        setDeleteConfirm(null)
      }
    } catch (err) {
      console.error('Error deleting batch:', err)
    }
  }

  const handleAdvance = async (batch: any) => {
    const nextSem = (batch.currentSemesterNumber || 1) + 1
    const total = parseInt(batch.totalSemesters || '8', 10)

    if (nextSem > total) {
      setAdvanceMsg({
        id: batch.id,
        msg: `All ${total} semesters completed! Batch is graduated.`,
        type: 'error',
      })
      setTimeout(() => setAdvanceMsg(null), 3000)
      return
    }

    setAdvancing(batch.id)
    try {
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSemesterNumber: nextSem,
          ...(nextSem >= total ? { status: 'completed' } : {}),
        }),
      })
      if (res.ok) {
        setAdvanceMsg({ id: batch.id, msg: `Advanced to Semester ${nextSem}!`, type: 'success' })
        fetchBatches()
        setTimeout(() => setAdvanceMsg(null), 3000)
      }
    } catch (err) {
      console.error('Error advancing batch:', err)
    } finally {
      setAdvancing(null)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active') return <Clock className="w-3.5 h-3.5 text-green-500" />
    if (status === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
    return <PauseCircle className="w-3.5 h-3.5 text-yellow-500" />
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700 border border-green-200'
    if (status === 'completed') return 'bg-blue-100 text-blue-700 border border-blue-200'
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  }

  const avatarColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-orange-500 to-amber-600',
    'from-cyan-500 to-sky-600',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
              <p className="text-sm text-gray-500">
                {totalDocs} batch{totalDocs !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
          <Link
            href="/batches/create"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">New Batch</span>
          </Link>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by batch name or session..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Found</h3>
            <p className="text-gray-500 mb-6">
              {search || statusFilter !== 'all' || departmentFilter !== 'all'
                ? 'No batches match your search criteria.'
                : 'Create your first batch to start tracking semester progression.'}
            </p>
            <Link
              href="/batches/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>New Batch</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {batches.map((batch: any, idx: number) => {
              const total = parseInt(batch.totalSemesters || '8', 10)
              const current = batch.currentSemesterNumber || 1
              const progress = Math.round((current / total) * 100)
              const isLastSem = current >= total

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  {/* Top accent */}
                  <div
                    className={`h-1.5 bg-gradient-to-r ${avatarColors[idx % avatarColors.length]}`}
                  />

                  <div className="p-5">
                    {/* Avatar + Name */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div
                        className={`w-11 h-11 bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
                      >
                        {batch.startYear?.toString().slice(-2) || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {batch.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {batch.department?.name || 'No Department'}
                        </p>
                      </div>
                    </div>

                    {/* Session */}
                    {batch.session && (
                      <p className="text-xs text-gray-500 mb-3">Session: {batch.session}</p>
                    )}

                    {/* Semester Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Semester Progress</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {current}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            batch.status === 'completed'
                              ? 'bg-blue-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Currently on Semester {current}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-1.5 mb-4">
                      {getStatusIcon(batch.status)}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(batch.status)}`}
                      >
                        {batch.status}
                      </span>
                    </div>

                    {/* Advance message */}
                    {advanceMsg?.id === batch.id && (
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

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {/* Complete & Advance */}
                      {batch.status === 'active' && (
                        <button
                          onClick={() => handleAdvance(batch)}
                          disabled={advancing === batch.id || isLastSem}
                          title={
                            isLastSem
                              ? 'All semesters completed'
                              : 'Complete current & advance to next semester'
                          }
                          className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                            isLastSem
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {advancing === batch.id ? (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowRight size={12} />
                          )}
                          <span>{isLastSem ? 'Complete' : 'Advance'}</span>
                        </button>
                      )}

                      {/* View/Edit/Delete */}
                      <div
                        className={`flex items-center space-x-1 ${batch.status !== 'active' ? 'ml-auto' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <Link
                          href={`/batches/${batch.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/batches/edit/${batch.id}`}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(batch.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + Math.max(1, page - 2)
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Batch</h3>
            <p className="text-gray-600 text-center text-sm mb-6">
              Are you sure? This will not delete the semesters linked to this batch.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
