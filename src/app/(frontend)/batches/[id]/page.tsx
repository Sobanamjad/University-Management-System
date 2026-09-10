// src/app/(frontend)/batches/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  PauseCircle,
  BookOpen,
} from 'lucide-react'

export default function BatchDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [batch, setBatch] = useState<any>(null)
  const [semesters, setSemesters] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const [advanceMsg, setAdvanceMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!id) return
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [batchRes, semRes, stuRes] = await Promise.all([
        fetch(`/api/batches/${id}?depth=2`),
        fetch(`/api/semesters?where[batch][equals]=${id}&depth=1&limit=20`),
        fetch(`/api/students?where[batch][equals]=${id}&depth=1&limit=100`),
      ])
      const batchData = await batchRes.json()
      const semData = await semRes.json()
      const stuData = await stuRes.json()
      setBatch(batchData)
      setSemesters(semData.docs || [])
      setStudents(stuData.docs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdvance = async () => {
    if (!batch) return
    const nextSem = (batch.currentSemesterNumber || 1) + 1
    const total = parseInt(batch.totalSemesters || '8', 10)

    if (nextSem > total) {
      setAdvanceMsg({ msg: `All ${total} semesters completed!`, type: 'error' })
      return
    }

    setAdvancing(true)
    try {
      const res = await fetch(`/api/batches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSemesterNumber: nextSem,
          ...(nextSem >= total ? { status: 'completed' } : {}),
        }),
      })
      if (res.ok) {
        setAdvanceMsg({ msg: `Advanced to Semester ${nextSem}!`, type: 'success' })
        fetchAll()
        setTimeout(() => setAdvanceMsg(null), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAdvancing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this batch? This will not delete linked semesters.')) return
    await fetch(`/api/batches/${id}`, { method: 'DELETE' })
    router.push('/batches')
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700 border border-green-200'
    if (status === 'completed') return 'bg-blue-100 text-blue-700 border border-blue-200'
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  }

  const getSemStatusColor = (status: string) => {
    if (status === 'ongoing') return 'bg-green-100 text-green-700'
    if (status === 'upcoming') return 'bg-yellow-100 text-yellow-700'
    if (status === 'completed') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Batch not found</h2>
          <Link href="/batches" className="text-blue-600 hover:underline">Back to Batches</Link>
        </div>
      </div>
    )
  }

  const total = parseInt(batch.totalSemesters || '8', 10)
  const current = batch.currentSemesterNumber || 1
  const progress = Math.round((current / total) * 100)
  const isLastSem = current >= total

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/batches" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
              <p className="text-sm text-gray-500">{batch.department?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/batches/edit/${id}`}
              className="flex items-center space-x-1.5 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Progress Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusBadge(batch.status)}`}>
                  {batch.status}
                </span>
                {batch.session && (
                  <span className="text-sm text-gray-500">Session: {batch.session}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Currently on <span className="font-semibold text-gray-900">Semester {current}</span> of {total}
              </p>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{progress}% complete</p>
            </div>

            {/* Advance button */}
            {batch.status === 'active' && (
              <div className="flex flex-col items-center gap-2">
                {advanceMsg && (
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    advanceMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {advanceMsg.msg}
                  </div>
                )}
                <button
                  onClick={handleAdvance}
                  disabled={advancing || isLastSem}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isLastSem
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {advancing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  <span>{isLastSem ? 'All Semesters Done' : `Complete & Advance to Sem ${current + 1}`}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-500">Department</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{batch.department?.name || '—'}</p>
            <p className="text-xs text-gray-400">{batch.department?.code}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-500">Students</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-500">Semesters Created</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{semesters.length}/{total}</p>
          </div>
        </div>

        {/* Semesters List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Semesters</h2>
            <Link
              href={`/semesters/create?batch=${id}&department=${batch.department?.id}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Semester
            </Link>
          </div>
          {semesters.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No semesters linked to this batch yet.</p>
              <Link
                href={`/semesters/create?batch=${id}&department=${batch.department?.id}`}
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                Create first semester
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {semesters
                .sort((a, b) => Number(a.semesterNumber) - Number(b.semesterNumber))
                .map((sem: any) => (
                  <div key={sem.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        Number(sem.semesterNumber) === current
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sem.semesterNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{sem.name}</p>
                        <p className="text-xs text-gray-500">
                          {sem.startDate ? new Date(sem.startDate).toLocaleDateString() : '—'} →{' '}
                          {sem.endDate ? new Date(sem.endDate).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {Number(sem.semesterNumber) === current && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Current</span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getSemStatusColor(sem.status)}`}>
                        {sem.status}
                      </span>
                      <Link href={`/semesters/${sem.id}`} className="text-gray-400 hover:text-blue-600 text-xs">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Students ({students.length})</h2>
          </div>
          {students.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No students linked to this batch yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {students.map((stu: any) => (
                <div key={stu.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stu.user?.name || stu.displayTitle}</p>
                    <p className="text-xs text-gray-500">Roll No: {stu.rollNo}</p>
                  </div>
                  <Link href={`/students/${stu.id}`} className="text-xs text-blue-600 hover:underline">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
