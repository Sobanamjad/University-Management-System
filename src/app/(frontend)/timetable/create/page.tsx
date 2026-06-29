// src/app/(frontend)/timetable/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookMarked, Save, Info } from 'lucide-react'

const DAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
]

const TIME_SLOTS = [
  { label: '08:00 - 09:00', value: '08:00-09:00' },
  { label: '09:00 - 10:00', value: '09:00-10:00' },
  { label: '10:00 - 11:00', value: '10:00-11:00' },
  { label: '11:00 - 12:00', value: '11:00-12:00' },
  { label: '12:00 - 13:00', value: '12:00-13:00' },
  { label: '13:00 - 14:00', value: '13:00-14:00' },
  { label: '14:00 - 15:00', value: '14:00-15:00' },
  { label: '15:00 - 16:00', value: '15:00-16:00' },
  { label: '16:00 - 17:00', value: '16:00-17:00' },
]

export default function CreateTimetablePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  const [formData, setFormData] = useState({
    department: '',
    semester: '',
    class: '',
    teacher: '',
    subject: '',
    day: '',
    timeSlot: '',
    room: '',
    lectureType: 'theory',
    status: 'active',
  })

  // Initial fetch for departments
  useEffect(() => {
    fetch('/api/departments?limit=100')
      .then((res) => res.json())
      .then((data) => setDepartments(data.docs || []))
  }, [])

  // Fetch data based on department
  useEffect(() => {
    if (formData.department) {
      const q = new URLSearchParams({
        limit: '100',
        where: JSON.stringify({ department: { equals: formData.department } }),
      })
      fetch(`/api/semesters?${q}`)
        .then((res) => res.json())
        .then((data) => setSemesters(data.docs || []))

      fetch(`/api/courses?${q}`)
        .then((res) => res.json())
        .then((data) => setSubjects(data.docs || []))

      const teacherQ = new URLSearchParams({
        limit: '100',
        where: JSON.stringify({
          and: [
            { role: { equals: 'teacher' } },
            { 'teacherInfo.department': { equals: formData.department } },
          ],
        }),
      })
      fetch(`/api/users?${teacherQ}`)
        .then((res) => res.json())
        .then((data) => setTeachers(data.docs || []))
    } else {
      setSemesters([])
      setSubjects([])
      setTeachers([])
    }
  }, [formData.department])

  // Fetch classes based on department and semester
  useEffect(() => {
    if (formData.department && formData.semester) {
      const q = new URLSearchParams({
        limit: '100',
        where: JSON.stringify({
          and: [
            { department: { equals: formData.department } },
            { semester: { equals: formData.semester } },
          ],
        }),
      })

      fetch(`/api/classes?${q}`)
        .then((res) => res.json())
        .then((data) => setClasses(data.docs || []))
    } else {
      setClasses([])
    }
  }, [formData.department, formData.semester])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Reset dependant fields
    if (name === 'department') {
      setFormData((prev) => ({ ...prev, semester: '', class: '', teacher: '', subject: '' }))
    }
    if (name === 'semester') {
      setFormData((prev) => ({ ...prev, class: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...formData,
      department: Number(formData.department),
      semester: Number(formData.semester),
      class: Number(formData.class),
      teacher: Number(formData.teacher),
      subject: Number(formData.subject),
    }

    console.log('Submitting Timetable Entry:', payload)

    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          router.push('/timetable')
        } else {
          res.json().then((data) => {
            setError(
              data.errors?.[0]?.message ||
                'Failed to create timetable entry. Check for double bookings or room conflicts.',
            )
            setLoading(false)
          })
        }
      })
      .catch(() => {
        setError('An error occurred while creating the timetable entry.')
        setLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/timetable"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Timetable Entry</h1>
              <p className="text-sm text-gray-600">Schedule a class session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start">
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Context Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm mb-2">
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Department</label>
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all text-gray-700"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Semester</label>
                  <select
                    name="semester"
                    required
                    disabled={!formData.department}
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-all text-gray-700"
                  >
                    <option value="">Select Sem</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Core Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="class"
                    required
                    disabled={!formData.semester}
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-shadow"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacher"
                    required
                    disabled={!formData.department}
                    value={formData.teacher}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-shadow"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject/Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    required
                    disabled={!formData.department}
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-shadow"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="day"
                    required
                    value={formData.day}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  >
                    <option value="">Select Day</option>
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="timeSlot"
                    required
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  >
                    <option value="">Select Time Slot</option>
                    {TIME_SLOTS.map((ts) => (
                      <option key={ts.value} value={ts.value}>
                        {ts.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room"
                    required
                    placeholder="e.g., Room 101, Lab 3"
                    value={formData.room}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lecture Type
                  </label>
                  <select
                    name="lectureType"
                    required
                    value={formData.lectureType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
              <Link
                href="/timetable"
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.class || !formData.teacher || !formData.subject}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
              >
                <Save size={18} />
                <span>{loading ? 'Processing...' : 'Create Entry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
