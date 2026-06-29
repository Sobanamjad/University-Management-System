// src/app/(frontend)/courses/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Save, Info } from 'lucide-react'

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    creditHours: 3,
    department: '',
    semester: '',
    teacher: '',
  })

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
      setSemesters([])
      setTeachers([])
    }
  }, [formData.department])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'department') {
      setFormData((prev) => ({ ...prev, semester: '', teacher: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...formData,
      creditHours: Number(formData.creditHours),
      department: Number(formData.department),
      semester: Number(formData.semester),
      teacher: formData.teacher ? Number(formData.teacher) : undefined,
    }

    fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          router.push('/courses')
        } else {
          res.json().then((data) => {
            setError(data.errors?.[0]?.message || 'Failed to create course. Code may already exist.')
            setLoading(false)
          })
        }
      })
      .catch(() => {
        setError('An error occurred while creating the course.')
        setLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/courses"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Course</h1>
              <p className="text-sm text-gray-600">Create a new university course</p>
            </div>
          </div>
        </div>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm mb-2">
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Department <span className="text-red-500">*</span></label>
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all text-gray-700"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
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
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-all text-gray-700"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Introduction to Computer Science"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g., CS101"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Hours <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="creditHours"
                    required
                    min="1"
                    max="6"
                    value={formData.creditHours}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher (Optional)</label>
                  <select
                    name="teacher"
                    disabled={!formData.department}
                    value={formData.teacher}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 transition-shadow"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
              <Link
                href="/courses"
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.code || !formData.department || !formData.semester}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
              >
                <Save size={18} />
                <span>{loading ? 'Processing...' : 'Create Course'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
