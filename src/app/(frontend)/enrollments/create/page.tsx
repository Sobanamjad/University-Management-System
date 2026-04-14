// src/app/(frontend)/enrollments/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck, Save, Info, Calendar } from 'lucide-react'

export default function CreateEnrollmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [universities, setUniversities] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  const [formData, setFormData] = useState({
    university: '',
    department: '',
    semester: '',
    student: '',
    class: '',
    status: 'enrolled',
  })

  // Initial fetch: Universities
  useEffect(() => {
    fetch('/api/universities?limit=100')
      .then((res) => res.json())
      .then((data) => setUniversities(data.docs || []))
  }, [])

  // Depend fetch: Departments when University changes
  useEffect(() => {
    if (formData.university) {
      fetch('/api/departments?limit=100')
        .then((res) => res.json())
        .then((data) => setDepartments(data.docs || []))
    }
  }, [formData.university])

  // Depend fetch: Semesters when University or Department changes
  useEffect(() => {
    if (formData.university && formData.department) {
      const q = new URLSearchParams({
        limit: '100',
        where: JSON.stringify({
          and: [
            { university: { equals: formData.university } },
            { department: { equals: formData.department } },
          ],
        }),
      })
      fetch(`/api/semesters?${q}`)
        .then((res) => res.json())
        .then((data) => setSemesters(data.docs || []))
    } else {
      setSemesters([])
    }
  }, [formData.university, formData.department])

  // Depend fetch: Students and Classes when Uni, Dept, AND Semester are selected
  useEffect(() => {
    if (formData.university && formData.department && formData.semester) {
      const q = new URLSearchParams({
        limit: '100',
        where: JSON.stringify({
          and: [
            { university: { equals: formData.university } },
            { department: { equals: formData.department } },
            { semester: { equals: formData.semester } },
          ],
        }),
      })

      // Fetch Students
      fetch(`/api/students?${q}`)
        .then((res) => res.json())
        .then((data) => setStudents(data.docs || []))

      // Fetch Classes
      fetch(`/api/classes?${q}`)
        .then((res) => res.json())
        .then((data) => setClasses(data.docs || []))
    }
  }, [formData.university, formData.department, formData.semester])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Reset dependant fields
    if (name === 'university') {
      setFormData((prev) => ({ ...prev, department: '', semester: '', student: '', class: '' }))
      setSemesters([])
      setStudents([])
      setClasses([])
    }
    if (name === 'department') {
      setFormData((prev) => ({ ...prev, semester: '', student: '', class: '' }))
      setStudents([])
      setClasses([])
    }
    if (name === 'semester') {
      setFormData((prev) => ({ ...prev, student: '', class: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Ensure we send IDs as numbers if possible, though Payload REST handles strings
      const payload = {
        ...formData,
        university: Number(formData.university),
        department: Number(formData.department),
        semester: Number(formData.semester),
        student: Number(formData.student),
        class: Number(formData.class),
      }

      console.log('Submitting Enrollment:', payload)

      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/enrollments')
      } else {
        const data = await res.json()
        setError(
          data.errors?.[0]?.message ||
            'Failed to create enrollment. Possibly duplicate or class is full.',
        )
      }
    } catch (err) {
      setError('An error occurred while creating the enrollment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/enrollments"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Enrollment</h1>
              <p className="text-sm text-gray-600">Register a student into a class section</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start">
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Filter Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm mb-2">
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">University</label>
                  <select
                    name="university"
                    required
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all text-gray-700"
                  >
                    <option value="">Select University</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Department</label>
                  <select
                    name="department"
                    required
                    disabled={!formData.university}
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-all text-gray-700"
                  >
                    <option value="">Select Dept</option>
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
              <div className="space-y-6 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="student"
                    required
                    disabled={!formData.semester}
                    value={formData.student}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-shadow"
                  >
                    <option value="">Select Student</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.displayTitle || st.id}
                      </option>
                    ))}
                  </select>
                  {!formData.semester && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                       Complete filters above to see students
                    </p>
                  )}
                </div>

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
                        {cl.title} - {cl.timeSlot} ({cl.currentStudents}/{cl.maxStudents})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="dropped">Dropped</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
              <Link
                href="/enrollments"
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.student || !formData.class}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
              >
                <Save size={18} />
                <span>{loading ? 'Processing...' : 'Confirm Enrollment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
