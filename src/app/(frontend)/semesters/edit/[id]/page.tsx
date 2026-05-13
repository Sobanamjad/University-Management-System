// src/app/(frontend)/semesters/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Save } from 'lucide-react'

export default function EditSemesterPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  
  const [universities, setUniversities] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    session: '',
    semesterNumber: '1',
    university: '',
    department: '',
    startDate: '',
    endDate: '',
    isActive: false,
  })

  useEffect(() => {
    const fetchRelationsAndData = async () => {
      try {
        const [uniRes, deptRes, semRes] = await Promise.all([
          fetch('/api/universities?limit=100'),
          fetch('/api/departments?limit=100'),
          fetch(`/api/semesters/${id}`)
        ])
        
        if (uniRes.ok) setUniversities((await uniRes.json()).docs || [])
        if (deptRes.ok) setDepartments((await deptRes.json()).docs || [])
        
        if (semRes.ok) {
          const data = await semRes.json()
          setFormData({
            name: data.name || '',
            code: data.code || '',
            session: data.session || '',
            semesterNumber: data.semesterNumber || '1',
            university: typeof data.university === 'object' ? data.university?.id : data.university || '',
            department: typeof data.department === 'object' ? data.department?.id : data.department || '',
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : '',
            isActive: data.isActive || false,
          })
        } else {
          setError('Failed to fetch semester details.')
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
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/semesters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/semesters')
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Failed to update semester')
      }
    } catch (err) {
      setError('An error occurred while updating the semester.')
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
              href="/semesters"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Semester</h1>
              <p className="text-sm text-gray-600">Update academic semester information</p>
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
                {/* Name & Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Session & Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Session <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="session"
                      required
                      value={formData.session}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester Number <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="semesterNumber"
                      required
                      value={formData.semesterNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <option key={n} value={n.toString()}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Relationships */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      University <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="university"
                      required
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="" disabled>Select University</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </select>
                  </div>
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
                      <option value="" disabled>Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="pt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                    Set as Active Semester
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
                <Link
                  href="/semesters"
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
