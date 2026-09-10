// src/app/(frontend)/classes/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Save, Info } from 'lucide-react'

export default function CreateClassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    department: '' as number | string,
    batch: '' as number | string,
    semester: '' as number | string,
    course: '' as number | string,
    teacher: '' as number | string,
    section: '',
    timeSlot: '08:00-09:00',
    lectureType: 'theory',
    status: 'scheduled',
  })
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const daysOptions = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
  ]

  const timeSlots = [
    { label: '08:00 - 09:00', value: '08:00-09:00' },
    { label: '09:00 - 10:00', value: '09:00-10:00' },
    { label: '10:00 - 11:00', value: '10:00-11:00' },
    { label: '11:00 - 12:00', value: '11:00-12:00' },
    { label: '12:00 - 13:00', value: '12:00-13:00' },
    { label: '13:00 - 14:00', value: '13:00-14:00' },
    { label: '14:00 - 15:00', value: '14:00-15:00' },
    { label: '15:00 - 16:00', value: '15:00-16:00' },
    { label: '16:00 - 17:00', value: '16:00-17:00' },
    { label: '17:00 - 18:00', value: '17:00-18:00' },
  ]

  // Load departments on mount
  useEffect(() => {
    fetch('/api/departments?limit=100')
      .then((r) => r.json())
      .then((d) => setDepartments(d.docs || []))
  }, [])

  // When department changes → load batches
  useEffect(() => {
    if (!formData.department) {
      setBatches([])
      setSemesters([])
      setCourses([])
      setTeachers([])
      return
    }
    const deptId = Number(formData.department)
    fetch(
      `/api/batches?where[department][equals]=${deptId}&where[status][equals]=active&limit=100&sort=-startYear`,
    )
      .then((r) => r.json())
      .then((d) => setBatches(d.docs || []))

    // Load all teachers (no department filter — field doesn't exist on teacher)
    fetch(`/api/users?where[role][equals]=teacher&limit=100`)
      .then((r) => r.json())
      .then((d) => setTeachers(d.docs || []))

    // Load courses for this department
    fetch(`/api/courses?where[department][equals]=${deptId}&limit=100`)
      .then((r) => r.json())
      .then((d) => setCourses(d.docs || []))
  }, [formData.department])

  // When batch changes → load semesters for that batch
  useEffect(() => {
    if (!formData.batch) {
      setSemesters([])
      setFormData((prev) => ({ ...prev, semester: '' }))
      return
    }
    fetch(`/api/semesters?where[batch][equals]=${Number(formData.batch)}&limit=100`)
      .then((r) => r.json())
      .then((d) => setSemesters(d.docs || []))
  }, [formData.batch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const numericFields = ['department', 'batch', 'semester', 'course', 'teacher', 'maxStudents']
    const parsed = numericFields.includes(name) ? (value ? Number(value) : '') : value

    setFormData((prev) => ({ ...prev, [name]: parsed }))

    // Reset dependent fields
    if (name === 'department') {
      setFormData((prev) => ({
        ...prev,
        department: value ? Number(value) : '',
        batch: '',
        semester: '',
        course: '',
        teacher: '',
      }))
      setSelectedDays([])
    }
    if (name === 'batch') {
      setFormData((prev) => ({ ...prev, batch: value ? Number(value) : '', semester: '' }))
    }
  }

  const toggleDay = (dayValue: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDays.length === 0) {
      setError('Please select at least one day.')
      return
    }
    setLoading(true)
    setError('')

    const payload: any = {
      section: formData.section,
      department: Number(formData.department),
      course: Number(formData.course),
      semester: Number(formData.semester),
      teacher: Number(formData.teacher),
      timeSlot: formData.timeSlot,
      lectureType: formData.lectureType,
      status: formData.status,
      days: selectedDays,
    }
    if (formData.batch) payload.batch = Number(formData.batch)

    fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          router.push('/classes')
        } else {
          res.json().then((data) => {
            console.error('Class create error:', JSON.stringify(data, null, 2))
            setError(data.errors?.[0]?.message || 'Failed to create class.')
            setLoading(false)
          })
        }
      })
      .catch(() => {
        setError('An error occurred while creating the class.')
        setLoading(false)
      })
  }

  const selectedBatch = batches.find((b) => String(b.id) === String(formData.batch))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center space-x-4">
          <Link href="/classes" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Class Section</h1>
            <p className="text-sm text-gray-600">Create a new class for a course</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start">
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Batch preview */}
            {selectedBatch && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">
                  Linked Batch
                </p>
                <p className="text-base font-bold text-blue-800">{selectedBatch.name}</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Semester {selectedBatch.currentSemesterNumber}/{selectedBatch.totalSemesters}
                </p>
              </div>
            )}

            <div className="space-y-8">
              {/* Step 1 — Department → Batch → Semester → Course chain */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Step 1 — Select Context
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      required
                      value={String(formData.department)}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">
                      Batch <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <select
                      name="batch"
                      value={String(formData.batch)}
                      onChange={handleChange}
                      disabled={!formData.department}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 text-gray-700"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} — Sem {b.currentSemesterNumber}/{b.totalSemesters}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="semester"
                      required
                      value={String(formData.semester)}
                      onChange={handleChange}
                      disabled={!formData.department}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 text-gray-700"
                    >
                      <option value="">
                        {formData.batch
                          ? 'Select Semester'
                          : 'Select Batch first (or select directly)'}
                      </option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course"
                      required
                      value={String(formData.course)}
                      onChange={handleChange}
                      disabled={!formData.department}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 text-gray-700"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2 — Class Details */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Step 2 — Class Details
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Teacher */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="teacher"
                      required
                      value={String(formData.teacher)}
                      onChange={handleChange}
                      disabled={!formData.department}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="section"
                      required
                      placeholder="A, B, C..."
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="timeSlot"
                      required
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lecture Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lecture Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lectureType"
                      required
                      value={formData.lectureType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="theory">Theory</option>
                      <option value="lab">Lab</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3 — Days */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Step 3 — Class Days <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {daysOptions.map((day) => {
                    const isSelected = selectedDays.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
                {selectedDays.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">Selected: {selectedDays.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
              <Link
                href="/classes"
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.department ||
                  !formData.course ||
                  !formData.semester ||
                  !formData.teacher ||
                  !formData.section ||
                  selectedDays.length === 0
                }
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Save size={18} />
                <span>{loading ? 'Creating...' : 'Create Class'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
