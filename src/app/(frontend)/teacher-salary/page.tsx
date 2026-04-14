'use client'

import { useState, useEffect } from 'react'
import {
  Banknote,
  Search,
  Filter,
  Plus,
  Users,
  Wallet,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import SalaryCard from './SalaryCard'

export default function TeacherSalaryPage() {
  const [salaries, setSalaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [stats, setStats] = useState({
    total: 0,
    permanent: 0,
    visiting: 0,
    totalBasePayroll: 0,
  })

  useEffect(() => {
    fetchSalaries()
  }, [search, typeFilter])

  const fetchSalaries = async () => {
    setLoading(true)
    try {
      const where: any = { and: [] }

      if (typeFilter !== 'all') {
        where.and.push({ teacherType: { equals: typeFilter } })
      }

      if (search) {
        where.and.push({ displayTitle: { contains: search } })
      }

      const query = new URLSearchParams({
        limit: '100',
        depth: '2',
        ...(where.and.length > 0 && { where: JSON.stringify(where) }),
      })

      const res = await fetch(`/api/teacher-salary?${query}`)
      const data = await res.json()
      setSalaries(data.docs || [])

      // Compute stats
      const docs = data.docs || []
      const permanent = docs.filter((s: any) => s.teacherType === 'permanent').length
      const visiting = docs.filter((s: any) => s.teacherType === 'visiting').length
      const totalBasePayroll = docs.reduce((acc: number, curr: any) => {
        if (curr.teacherType === 'permanent') return acc + (curr.fixedSalary || 0)
        return acc
      }, 0)

      setStats({
        total: docs.length,
        permanent,
        visiting,
        totalBasePayroll,
      })
    } catch (error) {
      console.error('Error fetching salaries:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payroll Management</h1>
              <p className="text-sm font-medium text-gray-500">Teacher Salary & Compensation</p>
            </div>
          </div>

          <Link
            href="/teacher-salary/create"
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Add Salary Record</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Total Faculty
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Teachers with active payroll</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Monthly Base
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              Rs. {stats.totalBasePayroll.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Permanent staff base pay</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <ArrowUpRight size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Permanent
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.permanent}</p>
            <p className="text-sm text-gray-500 mt-1">Full-time faculty members</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Visiting
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.visiting}</p>
            <p className="text-sm text-gray-500 mt-1">Adjunct/Visiting faculty</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by teacher name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="visiting">Visiting</option>
            </select>
          </div>
        </div>

        {/* Salaries Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading payroll data...</p>
          </div>
        ) : salaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaries.map((salary) => (
              <SalaryCard key={salary.id} salary={salary} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Banknote className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Salary Records Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We couldn't find any salary records matching your current filter criteria.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setTypeFilter('all')
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination placeholder */}
        {salaries.length > 0 && (
          <div className="flex items-center justify-between py-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-900">{salaries.length}</span> results
            </p>
            <div className="flex space-x-2">
              <button
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
