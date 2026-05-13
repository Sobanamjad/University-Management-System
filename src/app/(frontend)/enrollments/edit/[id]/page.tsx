// src/app/(frontend)/enrollments/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck, Save, Clock, GraduationCap } from 'lucide-react'

export default function EditEnrollmentPage() {
  const router = useRouter()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [enrollment, setEnrollment] = useState<any>(null)
  const [formData, setFormData] = useState({
    status: 'enrolled',
  })

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const res = await fetch(`/api/enrollments/${id}?depth=2`)
        if (res.ok) {
          const data = await res.json()
          setEnrollment(data)
          setFormData({
            status: data.status || 'enrolled',
          })
        } else {
          setError('Failed to fetch enrollment details.')
        }
      } catch (err) {
        setError('An error occurred while fetching the enrollment.')
      } finally {
        setFetching(false)
      }
    }
    fetchEnrollment()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/enrollments')
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Failed to update enrollment')
      }
    } catch (err) {
      setError('An error occurred while updating the enrollment.')
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Enrollment</h1>
              <p className="text-sm text-gray-600">Update registration status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
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

              <div className="space-y-8">
                {/* Visual Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                        Student
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {enrollment.student?.displayTitle || enrollment.student?.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                        Class
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {enrollment.class?.title}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {enrollment.class?.timeSlot} | {enrollment.semester?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Status
                  </label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-lg font-medium transition-all"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="dropped">Dropped</option>
                    <option value="completed">Completed</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Changing the status to "Dropped" or "Completed" will free up a seat in this
                    class.
                  </p>
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
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
                >
                  <Save size={18} />
                  <span>{loading ? 'Saving...' : 'Update Status'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
