'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Calendar, DollarSign, Tag, AlertCircle } from 'lucide-react'

interface FeeStructure {
  id: number
  title: string
  feeType: string
  amount: number
  dueDate: string
  status: 'active' | 'inactive' | 'archived'
  semester?: { id: number; name?: string; session?: string; semesterNumber?: string }
  batch?: { id: number; name?: string } | null
  lateFeePolicy?: { hasLateFee?: boolean; lateFeeAmount?: number }
}

const FEE_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  tuition:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  admission: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  exam:      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  library:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  lab:       { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200'   },
  sports:    { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200'   },
  transport: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  other:     { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200'   },
}

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  archived: 'bg-red-100 text-red-600',
}

export default function FeeStructurePage() {
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {})
  }, [])

  const fetchStructures = useCallback(async () => {
    setLoading(true)
    try {
      const and: any[] = []
      if (statusFilter !== 'all') and.push({ status: { equals: statusFilter } })
      if (search.trim()) and.push({ title: { contains: search.trim() } })

      const query = new URLSearchParams({
        limit: '100',
        depth: '2',
        sort: '-createdAt',
        ...(and.length > 0 && { where: JSON.stringify({ and }) }),
      })
      const res = await fetch(`/api/fee-structure?${query}`)
      const data = await res.json()
      setStructures(data.docs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { fetchStructures() }, [fetchStructures])

  const canManage = user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'accountant'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Structure</h1>
              <p className="text-sm font-medium text-gray-500">Manage semester fee structures</p>
            </div>
          </div>
          {canManage && (
            <Link
              href="/fee-structure/create"
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md shadow-indigo-100"
            >
              <Plus size={18} />
              <span>Add Fee Structure</span>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search fee structures…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : structures.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Fee Structures Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">No fee structures match your search criteria.</p>
            {canManage && (
              <Link href="/fee-structure/create" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Create First Structure
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {structures.map((fs) => {
              const typeColor = FEE_TYPE_COLORS[fs.feeType] || FEE_TYPE_COLORS.other
              const dueDate = new Date(fs.dueDate)
              const isOverdue = dueDate < new Date() && fs.status === 'active'
              return (
                <div key={fs.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-base">{fs.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fs.semester
                          ? `${fs.semester.session} — Sem ${fs.semester.semesterNumber}`
                          : 'All Semesters'}
                        {fs.batch ? ` · ${fs.batch.name}` : ' · All Batches'}
                      </p>
                    </div>
                    <span className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[fs.status]}`}>
                      {fs.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
                      <Tag size={10} className="inline mr-1" />
                      {fs.feeType.charAt(0).toUpperCase() + fs.feeType.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-2xl font-extrabold text-gray-900">
                      <span className="text-sm font-medium text-gray-400">PKR</span>
                      {fs.amount.toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {isOverdue && <AlertCircle size={12} />}
                      <Calendar size={12} />
                      {dueDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {fs.lateFeePolicy?.hasLateFee && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <DollarSign size={11} />
                      Late fee: PKR {fs.lateFeePolicy.lateFeeAmount?.toLocaleString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
