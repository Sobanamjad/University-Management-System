// src/app/(frontend)/students/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Save } from 'lucide-react'

export default function EditStudentPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    rollNo: '',
    batch: '',
    admissionDate: '',
    department: '',
    semester: '',
    user: '',
  })

  useEffect(() => {
    const fetchRelationsAndData = async () => {
      try {
        const [deptRes, semRes, userRes, studentRes] = await Promise.all([
          fetch('/api/departments?limit=100'),
          fetch('/api/semesters?limit=100'),
          fetch('/api/users?limit=100&where[role][equals]=student'),
          fetch(`/api/students/${id}`),
        ])

        if (deptRes.ok) setDepartments((await deptRes.json()).docs || [])
        if (semRes.ok) setSemesters((await semRes.json()).docs || [])
        if (userRes.ok) setUsers((await userRes.json()).docs || [])

        if (studentRes.ok) {
          const data = await studentRes.json()
          setFormData({
            rollNo: data.rollNo || '',
            batch: data.batch || '',
            admissionDate: data.admissionDate ? data.admissionDate.split('T')[0] : '',
            department:
              typeof data.department === 'object' ? data.department?.id : data.department || '',
            semester: typeof data.semester === 'object' ? data.semester?.id : data.semester || '',
            user: typeof data.user === 'object' ? data.user?.id : data.user || '',
          })
        } else {
          setError('Failed to fetch student details.')
        }
      } catch (err) {
        console.error(err)
        setError('An error occurred while fetching data.')
      } finally {
        setFetching(false)
      }
    }
    fetchRelationsAndData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/students')
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Failed to update student')
      }
    } catch (err) {
      setError('An error occurred while updating the student.')
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
              href="/students"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
              <p className="text-sm text-gray-600">Update University record</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          {fetching ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Roll No & Batch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      required
                      value={formData.rollNo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="batch"
                      required
                      value={formData.batch}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Admission Date & Account Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      required
                      value={formData.admissionDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Account <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="user"
                      required
                      value={formData.user}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="" disabled>
                        Select Student Account
                      </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Relationships */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <option value="" disabled>
                        Select Department
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>
                      Select Semester
                    </option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
                <Link
                  href="/students"
                  className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
                >
                  <Save size={18} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
