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
  const [courses, setCourses] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    section: '',
    department: '',
    course: '',
    semester: '',
    teacher: '',
    timeSlot: '08:00-09:00',
    maxStudents: 20,
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

  // Initial fetch for departments
  useEffect(() => {
    fetch('/api/departments?limit=100')
      .then((res) => res.json())
      .then((data) => setDepartments(data.docs || []))
      .catch((err) => console.error(err))
  }, [])

  // Fetch data based on department
  useEffect(() => {
    if (formData.department) {
      const q = new URLSearchParams({
        limit: '100',
        where: JSON.stringify({ department: { equals: formData.department } }),
      })

      fetch(`/api/courses?${q}`)
        .then((res) => res.json())
        .then((data) => setCourses(data.docs || []))
        .catch((err) => console.error(err))

      fetch(`/api/semesters?${q}`)
        .then((res) => res.json())
        .then((data) => setSemesters(data.docs || []))
        .catch((err) => console.error(err))

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
        .catch((err) => console.error(err))
    } else {
      setCourses([])
      setSemesters([])
      setTeachers([])
    }
  }, [formData.department])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'department') {
      setFormData((prev) => ({ ...prev, course: '', semester: '', teacher: '' }))
    }
  }
  
  const toggleDay = (dayValue: string) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
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

    const payload = {
      ...formData,
      maxStudents: Number(formData.maxStudents),
      department: Number(formData.department),
      course: Number(formData.course),
      semester: Number(formData.semester),
      teacher: Number(formData.teacher),
      days: selectedDays,
    }

    fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          router.push('/classes')
        } else {
          res.json().then((data) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/classes"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
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
      </div>

      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start">
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm">
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Department <span className="text-red-500">*</span></label>
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Course <span className="text-red-500">*</span></label>
                  <select
                    name="course"
                    required
                    disabled={!formData.department}
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Semester <span className="text-red-500">*</span></label>
                  <select
                    name="semester"
                    required
                    disabled={!formData.department}
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Teacher <span className="text-red-500">*</span></label>
                  <select
                    name="teacher"
                    required
                    disabled={!formData.department}
                    value={formData.teacher}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="section"
                    required
                    placeholder="e.g., A, B, C"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="maxStudents"
                    required
                    min="1"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Type <span className="text-red-500">*</span></label>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot <span className="text-red-500">*</span></label>
                  <select
                    name="timeSlot"
                    required
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">Class Days <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {daysOptions.map(day => {
                    const isSelected = selectedDays.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
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
                disabled={loading || !formData.course || !formData.department || !formData.semester || !formData.teacher || selectedDays.length === 0}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
              >
                <Save size={18} />
                <span>{loading ? 'Processing...' : 'Create Class Section'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
