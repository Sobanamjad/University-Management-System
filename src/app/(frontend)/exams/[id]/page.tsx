'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Calendar, Clock, MapPin, Award, BookOpen } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  scheduled:   'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [exam, setExam]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/exams/${id}?depth=2`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setExam)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!exam) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Exam not found</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/exams" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{exam.title}</h1>
            <p className="text-sm text-gray-500">Exam Details</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[exam.status] || 'bg-gray-100 text-gray-700'}`}>
            {exam.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Exam Type" value={exam.examType?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} />
            <Field label="Course" value={exam.course ? `${exam.course.code} — ${exam.course.title}` : 'N/A'} />
            <Field
              label="Date"
              value={exam.examDate ? new Date(exam.examDate).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
              icon={<Calendar size={16} className="text-gray-400" />}
            />
            <Field
              label="Time"
              value={exam.startTime ? `${exam.startTime}${exam.endTime ? ' — ' + exam.endTime : ''}` : 'Not specified'}
              icon={<Clock size={16} className="text-gray-400" />}
            />
            <Field
              label="Venue"
              value={exam.venue || 'Not specified'}
              icon={<MapPin size={16} className="text-gray-400" />}
            />
            <Field label="Semester" value={exam.semester ? `${exam.semester.session} — Sem ${exam.semester.semesterNumber}` : 'N/A'} />
            <Field
              label="Total Marks"
              value={String(exam.totalMarks)}
              icon={<Award size={16} className="text-orange-500" />}
            />
            <Field label="Passing Marks" value={`${exam.passingMarks} (${Math.round((exam.passingMarks / exam.totalMarks) * 100)}%)`} />
          </div>

          {exam.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description / Instructions</label>
              <p className="text-gray-700 text-sm whitespace-pre-line">{exam.description}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/exams" className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors text-sm">
              Back to Exams
            </Link>
            <Link href={`/grades?exam=${exam.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all text-sm">
              <BookOpen size={16} />
              View Grades
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
