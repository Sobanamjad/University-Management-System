// src/app/(frontend)/students/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  BookOpen,
  Hash,
  Edit,
  Clock,
  GraduationCap,
} from 'lucide-react'

export default function StudentViewPage() {
  const { id } = useParams()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/students/${id}?depth=2`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(setStudent)
      .catch(() => setError('Student not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Loading...</p>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Student Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <Link
            href="/students"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Students
          </Link>
        </div>
      </div>
    )
  }

  const user = student.user
  const dept = student.department
  const sem = student.semester

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-30">
        <Link
          href="/students"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
          <GraduationCap size={16} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-gray-900 leading-none">
            {user?.name || 'Student Profile'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Roll No: {student.rollNo}</p>
        </div>
        <Link
          href={`/students/edit/${student.id}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Edit size={14} />
          Edit
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* ── Profile Hero ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
              {/* Avatar */}
              <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center">
                <span className="text-4xl">🎓</span>
              </div>
              {/* Status badge */}
              <span
                className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold ${
                  student.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {student.status === 'active' ? '✅ Active' : '⭕ Inactive'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-3">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Roll No', value: student.rollNo, icon: Hash },
                { label: 'Batch', value: student.batch, icon: Calendar },
                { label: 'Department', value: dept?.name || 'Not assigned', icon: Building2 },
                { label: 'Semester', value: sem?.name || 'Not assigned', icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── Personal Information ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Personal Information
            </h3>
            <div className="space-y-3">
              <Row icon={Phone} label="Phone" value={user?.personalInfo?.phone} />
              <Row
                icon={Calendar}
                label="Date of Birth"
                value={
                  user?.personalInfo?.dateOfBirth
                    ? new Date(user.personalInfo.dateOfBirth).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : undefined
                }
              />
              <Row icon={User} label="Gender" value={user?.personalInfo?.gender} capitalize />
              <Row icon={CreditCard} label="CNIC" value={user?.personalInfo?.cnic} mono />
            </div>
          </div>

          {/* ── Address ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Address
            </h3>
            <div className="space-y-3">
              <Row icon={MapPin} label="Street" value={user?.address?.street} />
              <Row icon={MapPin} label="City" value={user?.address?.city} />
              <Row icon={MapPin} label="State" value={user?.address?.state} />
            </div>
          </div>

          {/* ── Academic Details ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Academic Details
            </h3>
            <div className="space-y-3">
              <Row icon={Hash} label="Roll Number" value={student.rollNo} />
              <Row icon={Calendar} label="Batch" value={student.batch} />
              <Row
                icon={Calendar}
                label="Admission Date"
                value={
                  student.admissionDate
                    ? new Date(student.admissionDate).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : undefined
                }
              />
              <Row icon={Building2} label="Department" value={dept?.name} />
              <Row icon={BookOpen} label="Current Semester" value={sem?.name} />
            </div>
          </div>

          {/* ── System Info ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              System Information
            </h3>
            <div className="space-y-3">
              <Row icon={Mail} label="Email" value={user?.email} />
              <Row
                icon={Clock}
                label="Registered On"
                value={student.createdAt ? new Date(student.createdAt).toLocaleString() : undefined}
              />
              <Row
                icon={Clock}
                label="Last Updated"
                value={student.updatedAt ? new Date(student.updatedAt).toLocaleString() : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper row component ──
function Row({
  icon: Icon,
  label,
  value,
  capitalize,
  mono,
}: {
  icon: any
  label: string
  value?: string
  capitalize?: boolean
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p
          className={`text-sm font-medium text-gray-800 mt-0.5 ${capitalize ? 'capitalize' : ''} ${mono ? 'font-mono' : ''}`}
        >
          {value || <span className="text-gray-300">—</span>}
        </p>
      </div>
    </div>
  )
}
