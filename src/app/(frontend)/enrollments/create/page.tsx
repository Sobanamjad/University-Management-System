// src/app/(frontend)/enrollments/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck, Save, Info } from 'lucide-react'

export default function CreateEnrollmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  const [formData, setFormData] = useState({
    department: '',
    student: '',
    class: '',
    status: 'enrolled',
  })

  // Load departments on mount
  useEffect(() => {
    fetch('/api/departments?limit=100')
      .then((res) => res.json())
      .then((data) => setDepartments(data.docs || []))
  }, [])

  // Load students + classes when department changes
  useEffect(() => {
    if (formData.department) {
      const deptId = Number(formData.department)

      // Students — filter by department
      fetch(
        `/api/students?limit=100&depth=1&where=${encodeURIComponent(
          JSON.stringify({ department: { equals: deptId } }),
        )}`,
      )
        .then((res) => res.json())
        .then((data) => setStudents(data.docs || []))

      // Classes — filter by department
      fetch(
        `/api/classes?limit=100&depth=1&where=${encodeURIComponent(
          JSON.stringify({ department: { equals: deptId } }),
        )}`,
      )
        .then((res) => res.json())
        .then((data) => setClasses(data.docs || []))
    } else {
      setStudents([])
      setClasses([])
    }
  }, [formData.department])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'department') {
      setFormData((prev) => ({ ...prev, department: value, student: '', class: '' }))
      setStudents([])
      setClasses([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        department: Number(formData.department),
        student: Number(formData.student),
        class: Number(formData.class),
        status: formData.status,
      }

      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/enrollments')
      } else {
        const data = await res.json()
        console.error('Enrollment error:', JSON.stringify(data, null, 2))
        setError(data.errors?.[0]?.message || 'Failed to create enrollment.')
      }
    } catch {
      setError('An error occurred while creating the enrollment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center space-x-4">
          <Link href="/enrollments" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
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

      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start">
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  name="student"
                  required
                  disabled={!formData.department}
                  value={formData.student}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                >
                  <option value="">
                    {formData.department ? 'Select Student' : 'Select department first'}
                  </option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.displayTitle || st.rollNo || st.id}
                    </option>
                  ))}
                </select>
                {formData.department && students.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No students found in this department.
                  </p>
                )}
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="class"
                  required
                  disabled={!formData.department}
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                >
                  <option value="">
                    {formData.department ? 'Select Class' : 'Select department first'}
                  </option>
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.title || cl.id} — {cl.timeSlot}
                    </option>
                  ))}
                </select>
                {formData.department && classes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No classes found in this department.
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
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
