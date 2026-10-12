'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Award, Search, Plus, TrendingUp } from 'lucide-react'

interface GradeRow {
  id: number
  displayTitle?: string
  student?: { id: number; displayTitle: string; rollNo: string }
  exam?: { id: number; title: string; examType: string; totalMarks: number }
  obtainedMarks: number
  grade: string
  gpa?: number | null
}

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  'A+': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  A: { bg: 'bg-green-100', text: 'text-green-700' },
  'A-': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'B+': { bg: 'bg-blue-100', text: 'text-blue-700' },
  B: { bg: 'bg-sky-100', text: 'text-sky-700' },
  'B-': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'C+': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  C: { bg: 'bg-amber-100', text: 'text-amber-700' },
  'C-': { bg: 'bg-orange-100', text: 'text-orange-700' },
  D: { bg: 'bg-red-100', text: 'text-red-500' },
  F: { bg: 'bg-red-200', text: 'text-red-800' },
}

// Inner component that uses useSearchParams (must be inside Suspense)
function GradesContent() {
  const searchParams = useSearchParams()
  const examIdFromQuery = searchParams.get('exam') || ''

  const [grades, setGrades] = useState<GradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
  }, [])

  const fetchGrades = useCallback(async () => {
    setLoading(true)
    try {
      const and: any[] = []
      if (examIdFromQuery) and.push({ exam: { equals: examIdFromQuery } })
      if (gradeFilter !== 'all') and.push({ grade: { equals: gradeFilter } })
      if (search.trim()) and.push({ displayTitle: { contains: search.trim() } })

      const query = new URLSearchParams({
        limit: '500',
        depth: '2',
        sort: '-createdAt',
        ...(and.length > 0 && { where: JSON.stringify({ and }) }),
      })
      const res = await fetch(`/api/grades?${query}`, { credentials: 'include' })
      const data = await res.json()
      setGrades(data.docs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, gradeFilter, examIdFromQuery])

  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  const canManage =
    user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'teacher'

  const avgGpa =
    grades.length > 0
      ? (grades.reduce((s, g) => s + (g.gpa || 0), 0) / grades.length).toFixed(2)
      : '—'
  const passCount = grades.filter((g) => g.grade !== 'F').length
  const failCount = grades.filter((g) => g.grade === 'F').length

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Grades</h1>
              <p className="text-sm font-medium text-gray-500">Student marks and grades</p>
            </div>
          </div>
          {canManage && (
            <Link
              href="/grades/create"
              className="flex items-center space-x-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all font-semibold shadow-md shadow-violet-100"
            >
              <Plus size={18} />
              <span>Add Grade</span>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Records',
              value: grades.length,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
            },
            { label: 'Average GPA', value: avgGpa, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Passed', value: passCount, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Failed', value: failCount, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <TrendingUp size={20} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by student or exam…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm"
              />
            </div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm font-medium"
            >
              <option value="all">All Grades</option>
              {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : grades.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Grades Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">No grade records match your search.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student', 'Exam', 'Type', 'Obtained / Total', 'Grade', 'GPA'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((row) => {
                  const gc = GRADE_COLORS[row.grade] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  const pct = row.exam?.totalMarks
                    ? Math.round((row.obtainedMarks / row.exam.totalMarks) * 100)
                    : null
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {row.student?.displayTitle || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">{row.student?.rollNo}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {row.exam?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                          {row.exam?.examType?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{row.obtainedMarks}</span>
                        <span className="text-gray-400 text-sm">
                          {' '}
                          / {row.exam?.totalMarks ?? '—'}
                        </span>
                        {pct !== null && (
                          <span className="ml-1 text-xs text-gray-400">({pct}%)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${gc.bg} ${gc.text}`}
                        >
                          {row.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {row.gpa !== null && row.gpa !== undefined ? row.gpa.toFixed(1) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GradesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GradesContent />
    </Suspense>
  )
}
