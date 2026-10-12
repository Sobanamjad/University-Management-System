'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  UserCheck,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
  GraduationCap,
  BookOpen,
  Search,
  CheckCheck,
  AlertCircle,
  Loader2,
  Users,
  ChevronRight,
  FileText,
  Hash,
  RefreshCw,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'excused'

interface StudentEntry {
  id: number
  rollNo: string
  name: string
  displayTitle: string
  status: AttendanceStatus
  remarks: string
  existingAttendanceId?: number
}

interface Department {
  id: number
  name: string
  code: string
}
interface Batch {
  id: number
  name?: string
  startYear: number
  session?: string
  department: number | { id: number }
}
interface Semester {
  id: number
  name?: string
  session: string
  semesterNumber: string
  department: number | { id: number }
  isActive?: boolean
}
interface ClassItem {
  id: number
  title?: string
  section: string
  department: number | { id: number }
  semester?: number | { id: number }
  batch?: number | { id: number }
  course?: { id: number; title: string; code: string }
  teacher?: { id: number; name: string }
}

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  present: {
    label: 'Present',
    icon: CheckCircle2,
    bg: '#059669',
    light: '#d1fae5',
    text: '#065f46',
    ring: 'rgba(5,150,105,0.4)',
  },
  absent: {
    label: 'Absent',
    icon: XCircle,
    bg: '#dc2626',
    light: '#fee2e2',
    text: '#991b1b',
    ring: 'rgba(220,38,38,0.4)',
  },
  late: {
    label: 'Late',
    icon: Clock,
    bg: '#d97706',
    light: '#fef3c7',
    text: '#92400e',
    ring: 'rgba(217,119,6,0.4)',
  },
  leave: {
    label: 'Leave',
    icon: FileText,
    bg: '#2563eb',
    light: '#dbeafe',
    text: '#1e40af',
    ring: 'rgba(37,99,235,0.4)',
  },
  excused: {
    label: 'Excused',
    icon: AlertCircle,
    bg: '#7c3aed',
    light: '#ede9fe',
    text: '#4c1d95',
    ring: 'rgba(124,58,237,0.4)',
  },
} as const

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CreateAttendancePage() {
  const router = useRouter()

  // Filter state
  const [selectedDept, setSelectedDept] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')

  // Data state
  const [departments, setDepartments] = useState<Department[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [teachers, setTeachers] = useState<Array<{ id: number; name: string }>>([])

  // Student / attendance state
  const [students, setStudents] = useState<StudentEntry[]>([])
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false)
  const [searchStudent, setSearchStudent] = useState<string>('')
  const [hasExistingAttendance, setHasExistingAttendance] = useState<boolean>(false)

  // Session / submission state
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  // ── Initial load: current user + departments + teachers ────────────────────

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((res) => {
        if (res?.user) {
          setCurrentUser(res.user)
          if (res.user.role === 'teacher') setSelectedTeacher(String(res.user.id))
        }
      })
      .catch(() => {})

    fetch('/api/departments?limit=100&sort=name')
      .then((r) => r.json())
      .then((res) => setDepartments(res.docs || []))
      .catch(() => {})

    fetch('/api/users?where[role][equals]=teacher&limit=100&sort=name')
      .then((r) => r.json())
      .then((res) => setTeachers(res.docs || []))
      .catch(() => {})
  }, [])

  // ── Department change → load batches + semesters ───────────────────────────

  useEffect(() => {
    if (!selectedDept) {
      setBatches([])
      setSemesters([])
      setClasses([])
      setSelectedBatch('')
      setSelectedSemester('')
      setSelectedClass('')
      setStudents([])
      return
    }

    fetch(`/api/batches?where[department][equals]=${selectedDept}&limit=100&sort=-startYear`)
      .then((r) => r.json())
      .then((res) => setBatches(res.docs || []))
      .catch(() => setBatches([]))

    fetch(`/api/semesters?where[department][equals]=${selectedDept}&limit=100&sort=semesterNumber`)
      .then((r) => r.json())
      .then((res) => {
        const list: Semester[] = res.docs || []
        setSemesters(list)
        // Auto-select active semester if present
        const active = list.find((s) => s.isActive)
        if (active) setSelectedSemester(String(active.id))
      })
      .catch(() => setSemesters([]))

    setSelectedBatch('')
    setSelectedClass('')
    setStudents([])
  }, [selectedDept])

  // ── Dept / Semester / Batch → load classes ─────────────────────────────────

  useEffect(() => {
    if (!selectedDept) {
      setClasses([])
      setSelectedClass('')
      setStudents([])
      return
    }

    const and: any[] = [{ department: { equals: selectedDept } }]
    if (selectedSemester) and.push({ semester: { equals: selectedSemester } })
    if (selectedBatch) and.push({ batch: { equals: selectedBatch } })

    const query = new URLSearchParams({
      limit: '100',
      depth: '2',
      where: JSON.stringify({ and }),
    })

    fetch(`/api/classes?${query}`)
      .then((r) => r.json())
      .then((res) => setClasses(res.docs || []))
      .catch(() => setClasses([]))

    setSelectedClass('')
    setStudents([])
  }, [selectedDept, selectedSemester, selectedBatch])

  // ── Class + Date → load enrolled students + existing attendance ─────────────

  const loadClassStudents = useCallback(async () => {
    if (!selectedClass) {
      setStudents([])
      setHasExistingAttendance(false)
      return
    }
    setLoadingStudents(true)
    setError('')
    setSuccessMessage('')

    try {
      // 1. Get enrolled students
      const enrollRes = await fetch(
        `/api/enrollments?where[and][0][class][equals]=${selectedClass}&where[and][1][status][equals]=enrolled&depth=2&limit=200`,
      )
      const enrollData = await enrollRes.json()

      let rawStudents: Array<{ id: number; rollNo: string; name: string; displayTitle: string }> =
        []

      if (enrollData?.docs?.length > 0) {
        rawStudents = enrollData.docs
          .map((e: any) => {
            const s = e.student
            if (!s) return null
            const rollNo = s.rollNo || 'N/A'
            const userName =
              typeof s.user === 'object' && s.user?.name ? s.user.name : s.displayTitle || 'Student'
            return {
              id: s.id,
              rollNo,
              name: userName,
              displayTitle: s.displayTitle || `${rollNo} - ${userName}`,
            }
          })
          .filter(Boolean)
      } else {
        // Fallback: students by dept + batch (for classes with no formal enrollments)
        const fallbackAnd: any[] = [{ department: { equals: selectedDept } }]
        if (selectedBatch) fallbackAnd.push({ batch: { equals: selectedBatch } })
        const fallbackQuery = new URLSearchParams({
          limit: '100',
          depth: '2',
          where: JSON.stringify({ and: fallbackAnd }),
        })
        const fallbackData = await fetch(`/api/students?${fallbackQuery}`).then((r) => r.json())

        if (fallbackData?.docs?.length > 0) {
          rawStudents = fallbackData.docs.map((s: any) => {
            const rollNo = s.rollNo || 'N/A'
            const userName =
              typeof s.user === 'object' && s.user?.name ? s.user.name : s.displayTitle || 'Student'
            return {
              id: s.id,
              rollNo,
              name: userName,
              displayTitle: s.displayTitle || `${rollNo} - ${userName}`,
            }
          })
        }
      }

      // Sort by roll number
      rawStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }))

      // 2. Check existing attendance for this class + date
      const attQuery = new URLSearchParams({
        limit: '200',
        where: JSON.stringify({
          and: [{ class: { equals: selectedClass } }, { date: { equals: selectedDate } }],
        }),
      })
      const attData = await fetch(`/api/attendance?${attQuery}`).then((r) => r.json())
      const existingRecs: any[] = attData?.docs || []

      const existingMap = new Map<
        number,
        { id: number; status: AttendanceStatus; remarks: string }
      >()
      for (const rec of existingRecs) {
        const sid = typeof rec.student === 'object' ? rec.student?.id : rec.student
        if (sid)
          existingMap.set(sid, {
            id: rec.id,
            status: (rec.status as AttendanceStatus) || 'present',
            remarks: rec.remarks || '',
          })
      }

      setHasExistingAttendance(existingRecs.length > 0)

      // 3. Merge student list with existing attendance (default = present)
      const prepared: StudentEntry[] = rawStudents.map((s) => {
        const existing = existingMap.get(s.id)
        return {
          id: s.id,
          rollNo: s.rollNo,
          name: s.name,
          displayTitle: s.displayTitle,
          status: existing ? existing.status : 'present',
          remarks: existing ? existing.remarks : '',
          existingAttendanceId: existing?.id,
        }
      })

      setStudents(prepared)
    } catch (err: any) {
      console.error('Failed to load class students:', err)
      setError('Failed to load students for this class. Please try again.')
    } finally {
      setLoadingStudents(false)
    }
  }, [selectedClass, selectedDate, selectedDept, selectedBatch])

  useEffect(() => {
    loadClassStudents()
  }, [loadClassStudents])

  // ── Bulk helpers ───────────────────────────────────────────────────────────

  const setAllStatus = (s: AttendanceStatus) =>
    setStudents((prev) => prev.map((st) => ({ ...st, status: s })))
  const updateStatus = (studentId: number, s: AttendanceStatus) =>
    setStudents((prev) => prev.map((st) => (st.id === studentId ? { ...st, status: s } : st)))
  const updateRemarks = (studentId: number, r: string) =>
    setStudents((prev) => prev.map((st) => (st.id === studentId ? { ...st, remarks: r } : st)))

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = students.length
    const present = students.filter((s) => s.status === 'present').length
    const absent = students.filter((s) => s.status === 'absent').length
    const late = students.filter((s) => s.status === 'late').length
    const leave = students.filter((s) => s.status === 'leave').length
    const excused = students.filter((s) => s.status === 'excused').length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    return { total, present, absent, late, leave, excused, percentage }
  }, [students])

  // ── Filtered students (search) ─────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students
    const q = searchStudent.toLowerCase()
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q),
    )
  }, [students, searchStudent])

  // ── Submit all attendance ──────────────────────────────────────────────────

  const handleSubmitAll = async () => {
    if (!selectedClass) {
      setError('Please select a class first.')
      return
    }
    if (students.length === 0) {
      setError('No students to mark attendance for.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const teacherId =
        selectedTeacher || (currentUser?.role === 'teacher' ? String(currentUser.id) : undefined)
      let savedCount = 0
      let updatedCount = 0

      const promises = students.map(async (student) => {
        const body: any = {
          student: student.id,
          class: Number(selectedClass),
          date: selectedDate,
          status: student.status,
          remarks: student.remarks || '',
        }
        if (teacherId) body.markedBy = Number(teacherId)

        if (student.existingAttendanceId) {
          const res = await fetch(`/api/attendance/${student.existingAttendanceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include',
          })
          if (res.ok) updatedCount++
          return res.ok
        } else {
          const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include',
          })
          if (res.ok) savedCount++
          return res.ok
        }
      })

      const results = await Promise.all(promises)
      const successful = results.filter(Boolean).length

      if (successful === students.length) {
        setSuccessMessage(
          `✅ Attendance saved for all ${students.length} students` +
            (savedCount > 0 || updatedCount > 0
              ? ` (${savedCount > 0 ? `${savedCount} new` : ''}${savedCount > 0 && updatedCount > 0 ? ', ' : ''}${updatedCount > 0 ? `${updatedCount} updated` : ''})`
              : '') +
            '!',
        )
        setTimeout(() => router.push('/attendance'), 1800)
      } else {
        setSuccessMessage(
          `⚠️ Saved ${successful} of ${students.length} records. Some failed — please check and retry.`,
        )
      }
    } catch (err: any) {
      console.error('Error saving attendance:', err)
      setError('An error occurred while saving. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const currentClassDoc = useMemo(
    () => classes.find((c) => String(c.id) === selectedClass),
    [classes, selectedClass],
  )

  // Step: 1 = no dept, 2 = dept selected (choose class), 3 = class selected
  const step = !selectedDept ? 1 : !selectedClass ? 2 : 3

  const isTeacher = currentUser?.role === 'teacher'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(15,23,42,0.95)',
          borderBottom: '1px solid rgba(99,102,241,0.2)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 24px',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/attendance"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }}
            >
              <UserCheck size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Bulk Attendance Sheet
              </h1>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                {step === 1
                  ? 'Step 1 of 3 — Select Department'
                  : step === 2
                    ? 'Step 2 of 3 — Select Class Section'
                    : `Step 3 — ${currentClassDoc?.title || 'Class'} · ${selectedDate}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {students.length > 0 && (
              <>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#34d399',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ✓ {stats.present} Present
                </span>
                {stats.absent > 0 && (
                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ✗ {stats.absent} Absent
                  </span>
                )}
              </>
            )}
            <Link
              href="/attendance"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmitAll}
              disabled={submitting || students.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                background:
                  students.length === 0
                    ? 'rgba(99,102,241,0.25)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 10,
                border: 'none',
                cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: students.length > 0 ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                opacity: submitting ? 0.8 : 1,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Attendance{students.length > 0 ? ` (${students.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* ── Notifications ──────────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '14px 18px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#f87171',
              fontSize: 14,
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: '14px 18px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#34d399',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ── Filter Panel ───────────────────────────────────────────────── */}
        <div
          style={{
            background: 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20,
            padding: 28,
            backdropFilter: 'blur(10px)',
            marginBottom: 20,
          }}
        >
          {/* Progress breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            {['Department', 'Batch / Semester', 'Class Section'].map((label, i) => {
              const done = i + 1 < step
              const current = i + 1 === step
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: done
                          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                          : current
                            ? 'rgba(99,102,241,0.2)'
                            : 'rgba(255,255,255,0.04)',
                        border:
                          done || current
                            ? '1px solid rgba(99,102,241,0.5)'
                            : '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: done ? 'white' : current ? '#818cf8' : '#475569',
                      }}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: done || current ? 600 : 400,
                        color: done ? '#c7d2fe' : current ? '#818cf8' : '#475569',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && <ChevronRight size={14} color="#334155" />}
                </div>
              )
            })}
          </div>

          {/* ── Row 1: Department → Batch → Semester → Class ─────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 16,
            }}
          >
            {/* Step 1: Department */}
            <div>
              <label style={labelStyle('#6366f1')}>
                <Building2 size={13} />
                <span>1. Department</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={selectStyle(!!selectedDept, false)}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2a: Batch (optional) */}
            <div>
              <label style={labelStyle('#8b5cf6')}>
                <GraduationCap size={13} />
                <span>2. Batch</span>
                <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={!selectedDept}
                style={selectStyle(!!selectedBatch, !selectedDept)}
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.session || `Batch ${b.startYear}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2b: Semester (optional) */}
            <div>
              <label style={labelStyle('#8b5cf6')}>
                <Calendar size={13} />
                <span>Semester</span>
                <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedDept}
                style={selectStyle(!!selectedSemester, !selectedDept)}
              >
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.isActive ? '● ' : ''}
                    {s.session} — Sem {s.semesterNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Class */}
            <div>
              <label style={labelStyle('#10b981')}>
                <BookOpen size={13} />
                <span>3. Class Section</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedDept || classes.length === 0}
                style={selectStyle(!!selectedClass, !selectedDept || classes.length === 0)}
              >
                <option value="">
                  {!selectedDept
                    ? 'Select department first'
                    : classes.length === 0
                      ? 'No classes found'
                      : 'Select Class'}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title || `${(c.course as any)?.code || ''} — Sec ${c.section}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Row 2: Date + Teacher ──────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div>
              <label style={labelStyle('#94a3b8')}>
                <Calendar size={13} />
                <span>Attendance Date</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 10,
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={labelStyle('#94a3b8')}>
                <UserCheck size={13} />
                <span>Marked By</span>
                {isTeacher && <span style={{ fontSize: 10, color: '#059669' }}>(auto-set)</span>}
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={isTeacher}
                style={selectStyle(!!selectedTeacher, isTeacher)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Attendance Sheet ───────────────────────────────────────────── */}

        {!selectedClass ? (
          // Empty state
          <div
            style={{
              background: 'rgba(30,41,59,0.5)',
              border: '1px dashed rgba(99,102,241,0.3)',
              borderRadius: 20,
              padding: '80px 40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Users size={34} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>
              Select a Class to Begin
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 420, margin: '0 auto' }}>
              Pick a department, optionally filter by batch / semester, then select a class section
              — enrolled students will load automatically.
            </p>
          </div>
        ) : loadingStudents ? (
          // Loading state
          <div
            style={{
              background: 'rgba(30,41,59,0.5)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 20,
              padding: '80px 40px',
              textAlign: 'center',
            }}
          >
            <Loader2
              size={40}
              color="#6366f1"
              style={{
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
                display: 'block',
              }}
            />
            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 15 }}>
              Loading enrolled students…
            </p>
          </div>
        ) : students.length === 0 ? (
          // No students state
          <div
            style={{
              background: 'rgba(30,41,59,0.5)',
              border: '1px dashed rgba(245,158,11,0.3)',
              borderRadius: 20,
              padding: '60px 40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'rgba(245,158,11,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={28} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>
              No Enrolled Students
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 380, margin: '0 auto 20px' }}>
              No enrolled students found for this class. Please enroll students first.
            </p>
            <Link
              href="/enrollments"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: 'white',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Manage Enrollments
            </Link>
          </div>
        ) : (
          // ── Main attendance table ────────────────────────────────────────
          <div
            style={{
              background: 'rgba(30,41,59,0.8)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 20,
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
            }}
          >
            {/* Sheet heading */}
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                    {currentClassDoc?.title || 'Attendance Sheet'}
                  </h2>
                  {hasExistingAttendance && (
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: '#fbbf24',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ✎ Editing Existing
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    margin: '4px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Calendar size={12} /> {selectedDate} &nbsp;·&nbsp;
                  <Users size={12} /> {stats.total} Students
                </p>
              </div>

              {/* Live stats badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[
                  {
                    key: 'present',
                    count: stats.present,
                    suffix: `(${stats.percentage}%)`,
                    color: '#34d399',
                    bg: 'rgba(16,185,129,0.12)',
                    border: 'rgba(16,185,129,0.25)',
                    symbol: '✓',
                  },
                  {
                    key: 'absent',
                    count: stats.absent,
                    suffix: '',
                    color: '#f87171',
                    bg: 'rgba(239,68,68,0.12)',
                    border: 'rgba(239,68,68,0.25)',
                    symbol: '✗',
                  },
                  {
                    key: 'late',
                    count: stats.late,
                    suffix: '',
                    color: '#fbbf24',
                    bg: 'rgba(245,158,11,0.12)',
                    border: 'rgba(245,158,11,0.25)',
                    symbol: '⏱',
                  },
                  {
                    key: 'leave',
                    count: stats.leave,
                    suffix: '',
                    color: '#818cf8',
                    bg: 'rgba(99,102,241,0.12)',
                    border: 'rgba(99,102,241,0.25)',
                    symbol: '📋',
                  },
                ]
                  .filter((s) => s.count > 0 || s.key === 'present')
                  .map((s) => (
                    <div
                      key={s.key}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        color: s.color,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {s.symbol} {s.count} {s.key.charAt(0).toUpperCase() + s.key.slice(1)}{' '}
                      {s.suffix}
                    </div>
                  ))}
              </div>
            </div>

            {/* Toolbar: search + bulk buttons */}
            <div
              style={{
                padding: '14px 28px',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                background: 'rgba(15,23,42,0.3)',
              }}
            >
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#475569',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by name or roll number…"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: 36,
                    paddingRight: 16,
                    paddingTop: 9,
                    paddingBottom: 9,
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 10,
                    color: '#e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Bulk action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Bulk:</span>
                <button
                  onClick={() => setAllStatus('present')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.35)',
                    borderRadius: 8,
                    color: '#34d399',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <CheckCheck size={14} /> Mark All Present
                </button>
                <button
                  onClick={() => setAllStatus('absent')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8,
                    color: '#f87171',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <XCircle size={14} /> Mark All Absent
                </button>
                <button
                  onClick={() => loadClassStudents()}
                  title="Reload students"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 8,
                    color: '#818cf8',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Hint bar */}
            <div
              style={{
                padding: '10px 28px',
                background: 'rgba(99,102,241,0.05)',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={14} color="#6366f1" />
              <span style={{ fontSize: 12, color: '#64748b' }}>
                All students default to <strong style={{ color: '#34d399' }}>Present</strong>. Click{' '}
                <strong style={{ color: '#f87171' }}>Absent</strong> /{' '}
                <strong style={{ color: '#fbbf24' }}>Late</strong> /{' '}
                <strong style={{ color: '#818cf8' }}>Leave</strong> for exceptions, then hit{' '}
                <strong style={{ color: '#c7d2fe' }}>Save Attendance</strong>.
              </span>
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.5)' }}>
                    {['#', 'Roll No.', 'Student Name', 'Attendance Status', 'Remarks'].map(
                      (h, i) => (
                        <th
                          key={h}
                          style={{
                            padding:
                              i === 0
                                ? '12px 16px 12px 28px'
                                : i === 4
                                  ? '12px 28px 12px 16px'
                                  : '12px 16px',
                            textAlign: i === 3 ? 'center' : 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#475569',
                          }}
                        >
                          {i === 0 ? <Hash size={12} /> : h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const cfg = STATUS_CONFIG[student.status]
                    const isPresent = student.status === 'present'
                    const rowBg =
                      student.status === 'absent'
                        ? 'rgba(239,68,68,0.04)'
                        : student.status === 'late'
                          ? 'rgba(245,158,11,0.04)'
                          : student.status === 'leave'
                            ? 'rgba(99,102,241,0.04)'
                            : student.status === 'excused'
                              ? 'rgba(124,58,237,0.04)'
                              : 'transparent'

                    return (
                      <tr
                        key={student.id}
                        style={{
                          background: rowBg,
                          borderBottom: '1px solid rgba(99,102,241,0.07)',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* # */}
                        <td
                          style={{
                            padding: '14px 16px 14px 28px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#334155',
                          }}
                        >
                          {idx + 1}
                        </td>

                        {/* Roll No */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 12,
                              fontWeight: 700,
                              padding: '4px 10px',
                              background: 'rgba(99,102,241,0.1)',
                              border: '1px solid rgba(99,102,241,0.2)',
                              borderRadius: 6,
                              color: '#a5b4fc',
                            }}
                          >
                            {student.rollNo}
                          </span>
                        </td>

                        {/* Name + Avatar */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${isPresent ? '#05966922' : cfg.bg + '22'}, ${isPresent ? '#05966944' : cfg.bg + '44'})`,
                                border: `1px solid ${isPresent ? '#05966944' : cfg.bg + '44'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                color: isPresent ? '#34d399' : cfg.light,
                                flexShrink: 0,
                              }}
                            >
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                              {student.name}
                            </span>
                          </div>
                        </td>

                        {/* Status toggle buttons */}
                        <td style={{ padding: '14px 16px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            {(['present', 'absent', 'late', 'leave'] as AttendanceStatus[]).map(
                              (status) => {
                                const sc = STATUS_CONFIG[status]
                                const active = student.status === status
                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => updateStatus(student.id, status)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 8,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      border: active
                                        ? `1px solid ${sc.bg}`
                                        : '1px solid rgba(255,255,255,0.08)',
                                      background: active ? `${sc.bg}22` : 'rgba(255,255,255,0.03)',
                                      color: active ? sc.light : '#475569',
                                      boxShadow: active ? `0 0 12px ${sc.ring}` : 'none',
                                    }}
                                  >
                                    {sc.label}
                                  </button>
                                )
                              },
                            )}
                          </div>
                        </td>

                        {/* Remarks input */}
                        <td style={{ padding: '14px 28px 14px 16px' }}>
                          <input
                            type="text"
                            placeholder={student.status !== 'present' ? 'Add note…' : ''}
                            value={student.remarks}
                            onChange={(e) => updateRemarks(student.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '7px 12px',
                              background: 'rgba(15,23,42,0.4)',
                              border: '1px solid rgba(99,102,241,0.15)',
                              borderRadius: 8,
                              color: '#94a3b8',
                              fontSize: 12,
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}

                  {/* No search results */}
                  {filteredStudents.length === 0 && searchStudent && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: '40px',
                          textAlign: 'center',
                          color: '#475569',
                          fontSize: 14,
                        }}
                      >
                        No students match &quot;{searchStudent}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Bottom submit bar ────────────────────────────────────────── */}
            <div
              style={{
                padding: '18px 28px',
                borderTop: '1px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                background: 'rgba(15,23,42,0.4)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Total: <strong style={{ color: '#94a3b8' }}>{stats.total}</strong>
                </span>
                <span style={{ color: '#34d399' }}>
                  ✓ Present: <strong>{stats.present}</strong> ({stats.percentage}%)
                </span>
                {stats.absent > 0 && (
                  <span style={{ color: '#f87171' }}>
                    ✗ Absent: <strong>{stats.absent}</strong>
                  </span>
                )}
                {stats.late > 0 && (
                  <span style={{ color: '#fbbf24' }}>
                    ⏱ Late: <strong>{stats.late}</strong>
                  </span>
                )}
                {stats.leave > 0 && (
                  <span style={{ color: '#818cf8' }}>
                    📋 Leave: <strong>{stats.leave}</strong>
                  </span>
                )}
              </div>
              <button
                onClick={handleSubmitAll}
                disabled={submitting || students.length === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 12,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Saving Attendance…</span>
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    <span>Submit Attendance for {students.length} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1e293b; color: #e2e8f0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
        tbody tr:hover { background: rgba(99,102,241,0.04) !important; }
        button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function labelStyle(color: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color,
    marginBottom: 8,
  }
}

function selectStyle(hasValue: boolean, disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '11px 14px',
    background: disabled ? 'rgba(15,23,42,0.3)' : 'rgba(15,23,42,0.6)',
    border: `1px solid ${hasValue ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'}`,
    borderRadius: 10,
    color: hasValue ? '#e2e8f0' : '#64748b',
    fontSize: 14,
    fontWeight: 500,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    appearance: 'none' as const,
  }
}
