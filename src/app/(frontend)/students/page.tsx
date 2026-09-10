// src/app/(frontend)/students/page.tsx
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
  GraduationCap,
  User,
  Filter,
} from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [departments, setDepartments] = useState<any[]>([])
  const [batchFilter, setBatchFilter] = useState('all')
  const [batches, setBatches] = useState<any[]>([])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, departmentFilter, batchFilter])

  useEffect(() => {
    fetchStudents()
  }, [page, debouncedSearch, departmentFilter, batchFilter])

  useEffect(() => {
    Promise.all([
      fetch('/api/departments?limit=100').then((r) => r.json()),
      fetch('/api/batches?limit=100&where[status][equals]=active').then((r) => r.json()),
    ]).then(([depts, batches]) => {
      setDepartments(depts.docs || [])
      setBatches(batches.docs || [])
    })
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const conditions: Where[] = []

      if (debouncedSearch) {
        conditions.push({
          or: [
            { rollNo: { contains: debouncedSearch } },
            { displayTitle: { contains: debouncedSearch } },
          ],
        })
      }

      if (departmentFilter !== 'all') conditions.push({ department: { equals: departmentFilter } })
      if (batchFilter !== 'all') conditions.push({ batch: { equals: batchFilter } })

      const where: Where | undefined = conditions.length > 1 ? { and: conditions } : conditions[0]

      const queryString = stringify(
        { page, limit: 12, depth: 2, ...(where && { where }) },
        { addQueryPrefix: true },
      )

      const res = await fetch(`/api/students${queryString}`)
      const data = await res.json()
      setStudents(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setTotalDocs(data.totalDocs || 0)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <p className="text-sm text-gray-500">
                  {totalDocs} student{totalDocs !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Link
              href="/students/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Student</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by roll number or name..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[170px]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Batch filter */}
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-4">
              {search || departmentFilter !== 'all' || batchFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first student.'}
            </p>
            <Link
              href="/students/create"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {student.user?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Roll: {student.rollNo}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Dept:</span> {student.department?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Batch:</span> {student.batch?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Semester:</span>{' '}
                      {student.semester?.name || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.status || 'active'}
                    </span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/students/${student.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/students/edit/${student.id}`}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          </>
        )}
      </div>
    </div>
  )
}
