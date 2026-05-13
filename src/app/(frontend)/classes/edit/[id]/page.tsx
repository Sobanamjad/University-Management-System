// src/app/(frontend)/classes/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Users,
  BookOpen,
  User,
  Hash,
  Building2,
} from 'lucide-react'

export default function ClassEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    section: '',
    university: '',
    department: '',
    course: '',
    semester: '',
    teacher: '',
    days: [] as string[],
    timeSlot: '',
    maxStudents: 20,
    lectureType: 'theory',
    status: 'scheduled',
  })

  const [universities, setUniversities] = useState([])
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    fetchClassData()
    fetchOptions()
  }, [id])

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/classes/${id}?depth=2`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          section: data.section || '',
          university: data.university?.id || '',
          department: data.department?.id || '',
          course: data.course?.id || '',
          semester: data.semester?.id || '',
          teacher: data.teacher?.id || '',
          days: data.days || [],
          timeSlot: data.timeSlot || '',
          maxStudents: data.maxStudents || 20,
          lectureType: data.lectureType || 'theory',
          status: data.status || 'scheduled',
        })
      } else {
        setError('Failed to fetch class data')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [uniRes, deptRes, courseRes, semRes, teacherRes] = await Promise.all([
        fetch('/api/universities?limit=100'),
        fetch('/api/departments?limit=100'),
        fetch('/api/courses?limit=100'),
        fetch('/api/semesters?limit=100'),
        fetch('/api/users?where[role][equals]=teacher&limit=100'),
      ])

      const universitiesData = await uniRes.json()
      const departmentsData = await deptRes.json()
      const coursesData = await courseRes.json()
      const semestersData = await semRes.json()
      const teachersData = await teacherRes.json()

      setUniversities(universitiesData.docs || [])
      setDepartments(departmentsData.docs || [])
      setCourses(coursesData.docs || [])
      setSemesters(semestersData.docs || [])
      setTeachers(teachersData.docs || [])
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess('Class updated successfully!')
        setTimeout(() => router.push('/classes'), 1500)
      } else {
        const errorData = await res.json()
        setError(errorData.message || 'Failed to update class')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  const daysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 flex items-center shadow-sm">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/classes" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Class</h1>
                <p className="text-xs text-gray-500">Update class information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Form Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Class Information</h2>
            <p className="text-sm text-gray-500">Edit the details of this class section</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Hash size={16} className="mr-2 text-blue-500" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A, B, C"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Section identifier (A, B, C, etc.)</p>
                </div>

                {/* Lecture Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.lectureType}
                    onChange={(e) => setFormData({ ...formData, lectureType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Relations Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Building2 size={16} className="mr-2 text-blue-500" />
                Academic Relations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select University</option>
                    {universities.map((uni: any) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course: any) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem: any) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Teacher & Capacity Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <User size={16} className="mr-2 text-blue-500" />
                Teacher & Capacity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Students */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Students <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStudents: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="200"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of students allowed in this class
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Clock size={16} className="mr-2 text-blue-500" />
                Schedule
              </h3>

              {/* Days */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Class Days <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {daysList.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        formData.days.includes(day)
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select the days when this class meets</p>
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Time Slot</option>
                  <option value="08:00-09:00">08:00 - 09:00</option>
                  <option value="09:00-10:00">09:00 - 10:00</option>
                  <option value="10:00-11:00">10:00 - 11:00</option>
                  <option value="11:00-12:00">11:00 - 12:00</option>
                  <option value="12:00-13:00">12:00 - 13:00</option>
                  <option value="13:00-14:00">13:00 - 14:00</option>
                  <option value="14:00-15:00">14:00 - 15:00</option>
                  <option value="15:00-16:00">15:00 - 16:00</option>
                  <option value="16:00-17:00">16:00 - 17:00</option>
                  <option value="17:00-18:00">17:00 - 18:00</option>
                </select>
              </div>
            </div>

            {/* Status Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <BookOpen size={16} className="mr-2 text-blue-500" />
                Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <Link
              href="/classes"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
