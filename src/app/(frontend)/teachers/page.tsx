// src/app/(frontend)/teachers/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCog,
  Mail,
  Phone,
  Building2,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [departments, setDepartments] = useState<any[]>([])
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [designationFilter, setDesignationFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchTeachers()
  }, [page, search, departmentFilter, designationFilter])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments?limit=100')
      const data = await res.json()
      setDepartments(data.docs || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const and: any[] = [
        {
          or: [
            { role: { equals: 'teacher' } },
            { role: { equals: 'coordinator' } },
          ],
        },
      ]

      if (search) {
        and.push({
          or: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        })
      }

      if (departmentFilter !== 'all') {
        and.push({ 'teacherInfo.department': { equals: departmentFilter } })
      }

      if (designationFilter !== 'all') {
        and.push({ role: { equals: designationFilter } })
      }

      const where = { and }
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        depth: '2',
        where: JSON.stringify(where),
        sort: 'name',
      })

      const res = await fetch(`/api/users?${query}`)
      const data = await res.json()
      setTeachers(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setTotalDocs(data.totalDocs || 0)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTeachers()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDesignationBadge = (designation: string) => {
    if (designation === 'Permanent') return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    if (designation === 'visiting') return 'bg-amber-100 text-amber-700 border border-amber-200'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  const avatarColors = [
    'from-blue-500 to-indigo-600',
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
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teachers & Coordinators</h1>
                <p className="text-sm text-gray-500">
                  {totalDocs} staff member{totalDocs !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Link
              href="/teachers/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="font-medium">Add Teacher</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1) }}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white appearance-none min-w-[180px]"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={designationFilter}
                onChange={(e) => { setDesignationFilter(e.target.value); setPage(1) }}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white appearance-none min-w-[160px]"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teachers</option>
                <option value="coordinator">Coordinators</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teacher Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCog className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Found</h3>
            <p className="text-gray-500 mb-6">
              {search || departmentFilter !== 'all' || designationFilter !== 'all'
                ? 'No staff match your search criteria.'
                : 'Get started by adding your first teacher or coordinator.'}
            </p>
            <Link
              href="/teachers/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Add Teacher</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {teachers.map((teacher: any, idx: number) => (
              <div
                key={teacher.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                {/* Card Top Accent - color by role */}
                <div
                  className={`h-1.5 bg-gradient-to-r ${
                    teacher.role === 'coordinator'
                      ? 'from-purple-500 to-violet-600'
                      : 'from-blue-500 to-indigo-600'
                  }`}
                />

                <div className="p-5">
                  {/* Avatar + Name */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
                    >
                      {getInitials(teacher.name || 'T')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{teacher.name}</h3>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                            teacher.role === 'coordinator'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {teacher.role}
                        </span>
                      </div>
                  </div>

                  {/* Info Lines */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    {teacher.personalInfo?.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{teacher.personalInfo.phone}</span>
                      </div>
                    )}
                    {teacher.teacherInfo?.department && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {teacher.teacherInfo.department?.name || teacher.teacherInfo.department}
                        </span>
                      </div>
                    )}
                    {teacher.teacherInfo?.qualification && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Award className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{teacher.teacherInfo.qualification}</span>
                      </div>
                    )}
                    {teacher.teacherInfo?.joiningDate && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          Joined{' '}
                          {new Date(teacher.teacherInfo.joiningDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        teacher.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {teacher.status}
                    </span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/users/${teacher.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/users/edit/${teacher.id}`}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(teacher.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} &mdash; {totalDocs} teachers total
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Teacher</h3>
            <p className="text-gray-600 text-center text-sm mb-6">
              Are you sure you want to delete this teacher? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
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
