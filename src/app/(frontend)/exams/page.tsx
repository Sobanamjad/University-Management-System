'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, Search, Calendar, Clock, MapPin, Award } from 'lucide-react'

interface Exam {
  id: number
  title: string
  examType: string
  examDate: string
  startTime?: string | null
  endTime?: string | null
  venue?: string | null
  totalMarks: number
  passingMarks: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  course?: { id: number; title: string; code: string }
  semester?: { id: number; session: string; semesterNumber: string }
}

const STATUS_COLORS: Record<string, string> = {
  scheduled:   'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  quiz:         { bg: 'bg-sky-50',     text: 'text-sky-700'     },
  assignment:   { bg: 'bg-teal-50',    text: 'text-teal-700'    },
  midterm:      { bg: 'bg-orange-50',  text: 'text-orange-700'  },
  final:        { bg: 'bg-red-50',     text: 'text-red-700'     },
  lab_test:     { bg: 'bg-purple-50',  text: 'text-purple-700'  },
  project:      { bg: 'bg-indigo-50',  text: 'text-indigo-700'  },
  presentation: { bg: 'bg-pink-50',    text: 'text-pink-700'    },
}

export default function ExamsPage() {
  const [exams, setExams]               = useState<Exam[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter]     = useState('all')
  const [user, setUser]                 = useState<any>(null)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
  }, [])

  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      const and: any[] = []
      if (statusFilter !== 'all') and.push({ status: { equals: statusFilter } })
      if (typeFilter   !== 'all') and.push({ examType: { equals: typeFilter } })
      if (search.trim())          and.push({ title: { contains: search.trim() } })

      const query = new URLSearchParams({
        limit: '200',
        depth: '2',
        sort: '-examDate',
        ...(and.length > 0 && { where: JSON.stringify({ and }) }),
      })
      const res = await fetch(`/api/exams?${query}`)
      const data = await res.json()
      setExams(data.docs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter])

  useEffect(() => { fetchExams() }, [fetchExams])

  const canManage = user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'teacher'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Exams</h1>
              <p className="text-sm font-medium text-gray-500">Assessments and examinations</p>
            </div>
          </div>
          {canManage && (
            <Link
              href="/exams/create"
              className="flex items-center space-x-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md shadow-orange-100"
            >
              <Plus size={18} />
              <span>Schedule Exam</span>
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
                placeholder="Search exams…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="lab_test">Lab Test</option>
              <option value="project">Project</option>
              <option value="presentation">Presentation</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">No exams match your search criteria.</p>
            {canManage && (
              <Link href="/exams/create" className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all">
                Schedule First Exam
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {exams.map((exam) => {
              const typeColor = TYPE_COLORS[exam.examType] || TYPE_COLORS.quiz
              const examDate = new Date(exam.examDate)
              const passRate = Math.round((exam.passingMarks / exam.totalMarks) * 100)
              return (
                <Link key={exam.id} href={`/exams/${exam.id}`} className="block">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:border-orange-200 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate">{exam.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {exam.course ? `${exam.course.code} — ${exam.course.title}` : 'N/A'}
                        </p>
                      </div>
                      <span className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[exam.status]}`}>
                        {exam.status.replace('_', ' ')}
                      </span>
                    </div>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor.bg} ${typeColor.text} inline-block mb-3`}>
                      {exam.examType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                        {examDate.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      {(exam.startTime || exam.endTime) && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400 flex-shrink-0" />
                          {exam.startTime}{exam.endTime ? ` — ${exam.endTime}` : ''}
                        </div>
                      )}
                      {exam.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                          {exam.venue}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Award size={14} className="text-orange-500" />
                        <span className="font-semibold text-gray-900">{exam.totalMarks}</span>
                        <span className="text-gray-400">total marks</span>
                      </div>
                      <span className="text-xs text-gray-500">Pass: {exam.passingMarks} ({passRate}%)</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
