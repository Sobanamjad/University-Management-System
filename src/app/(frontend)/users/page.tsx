// src/app/(frontend)/users/page.tsx
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
  Users,
  UserCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const conditions: any[] = []

      if (search) {
        conditions.push({
          or: [{ name: { like: search } }, { email: { like: search } }],
        })
      }

      if (roleFilter === 'all') {
        conditions.push({
          role: { in: ['coordinator', 'teacher', 'student'] },
        })
      } else {
        conditions.push({ role: { equals: roleFilter } })
      }

      if (statusFilter !== 'all') {
        conditions.push({ status: { equals: statusFilter } })
      }

      const where = conditions.length > 1 ? { and: conditions } : conditions[0] || {}

      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(conditions.length && { where: JSON.stringify(where) }),
      })

      console.log('Fetching users with filter:', roleFilter, statusFilter)

      const res = await fetch(`/api/users?${query}`)
      const data = await res.json()

      console.log('Users fetched:', data.docs?.length || 0)
      setUsers(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'coordinator':
        return 'bg-blue-100 text-blue-700'
      case 'teacher':
        return 'bg-green-100 text-green-700'
      case 'student':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'coordinator':
        return '👔'
      case 'teacher':
        return '👨‍🏫'
      case 'student':
        return '🎓'
      default:
        return '👤'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                <p className="text-sm text-gray-600">Manage coordinators, teachers, and students</p>
              </div>
            </div>
            <Link
              href="/users/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add User</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter - Sirf coordinator, teacher, student options */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users (Coordinator, Teacher, Student)</option>
              <option value="coordinator">👔 Coordinators Only</option>
              <option value="teacher">👨‍🏫 Teachers Only</option>
              <option value="student">🎓 Students Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active Users</option>
              <option value="inactive">⭕ Inactive Users</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter size={20} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                Role: {roleFilter}
                <button onClick={() => setRoleFilter('all')} className="ml-2 hover:text-blue-900">
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                Search: {search}
                <button onClick={() => setSearch('')} className="ml-2 hover:text-gray-900">
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coordinators</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === 'coordinator').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👔</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === 'teacher').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👨‍🏫</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === 'student').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {roleFilter !== 'all'
                ? `No ${roleFilter}s found with the selected filters`
                : 'No users found with the selected filters'}
            </p>
            <button
              onClick={() => {
                setRoleFilter('all')
                setStatusFilter('all')
                setSearch('')
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xl">{getRoleIcon(user.role)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role === 'coordinator' && '👔 Coordinator'}
                          {user.role === 'teacher' && '👨‍🏫 Teacher'}
                          {user.role === 'student' && '🎓 Student'}
                          {user.role === 'admin' && '👑 Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {user.personalInfo?.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone size={14} className="mr-1" />
                              {user.personalInfo.phone}
                            </div>
                          )}
                          {user.address?.city && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin size={14} className="mr-1" />
                              {user.address.city}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.status === 'active' ? '✅ Active' : '⭕ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/users/${user.id}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/users/edit/${user.id}`}
                            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit size={18} />
                          </Link>
                          {user.status === 'active' ? (
                            <button
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deactivate User"
                            >
                              <Trash2 size={18} />
                            </button>
                          ) : (
                            <button
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activate User"
                            >
                              <Plus size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
