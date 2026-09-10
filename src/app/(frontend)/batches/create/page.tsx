// src/app/(frontend)/batches/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Save } from 'lucide-react'

export default function CreateBatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState<any[]>([])
  const [deptLoading, setDeptLoading] = useState(true)
  const [deptError, setDeptError] = useState('')

  const [formData, setFormData] = useState<{
    department: number | string
    startYear: number
    totalSemesters: string
    currentSemesterNumber: number
    session: string
    status: string
  }>({
    department: '',
    startYear: new Date().getFullYear(),
    totalSemesters: '8',
    currentSemesterNumber: 1,
    session: '',
    status: 'active',
  })

  useEffect(() => {
    setDeptLoading(true)
    fetch('/api/departments?limit=100')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => {
        setDepartments(d.docs || [])
        if (!d.docs?.length) setDeptError('No departments found. Please add a department first.')
      })
      .catch((e) => setDeptError(`Failed to load departments: ${e.message}`))
      .finally(() => setDeptLoading(false))
  }, [])

  // Auto-fill session when department + startYear change
  useEffect(() => {
    if (formData.startYear) {
      const endYear = formData.startYear + Math.ceil(parseInt(formData.totalSemesters) / 2)
      setFormData((prev) => ({ ...prev, session: `${formData.startYear}-${endYear}` }))
    }
  }, [formData.startYear, formData.totalSemesters])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'startYear' || name === 'currentSemesterNumber' || name === 'department'
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/batches')
      } else {
        const data = await res.json()
        console.error('Batch create error:', JSON.stringify(data, null, 2))
        setError(data.errors?.[0]?.message || data.message || 'Failed to create batch')
      }
    } catch {
      setError('An error occurred while creating the batch.')
    } finally {
      setLoading(false)
    }
  }

  const selectedDept = departments.find((d) => String(d.id) === String(formData.department))
  const programPrefix = formData.totalSemesters === '4' ? 'ADS' : 'BS'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center space-x-4">
          <Link href="/batches" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Batch</h1>
            <p className="text-sm text-gray-600">Create a new student batch</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Preview name */}
            {formData.department && formData.startYear && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">
                  Batch Name Preview
                </p>
                <p className="text-lg font-bold text-blue-800">
                  {programPrefix} {selectedDept?.name || 'Department'} {formData.startYear}
                </p>
              </div>
            )}

            <div className="space-y-5">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                {deptError && <p className="mb-1 text-xs text-red-600">{deptError}</p>}
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  disabled={deptLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                >
                  <option value="" disabled>
                    {deptLoading ? 'Loading departments...' : 'Select Department'}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Year + Total Semesters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="startYear"
                    required
                    min={2000}
                    max={2100}
                    value={formData.startYear}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Semesters <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="totalSemesters"
                    required
                    value={formData.totalSemesters}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="4">4 Semesters — ADS (2-year)</option>
                    <option value="8">8 Semesters — BS (4-year)</option>
                  </select>
                </div>
              </div>

              {/* Session + Current Semester */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    placeholder="e.g., 2024-2028"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Semester
                  </label>
                  <input
                    type="number"
                    name="currentSemesterNumber"
                    min={1}
                    max={8}
                    value={formData.currentSemesterNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
              <Link
                href="/batches"
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Save size={18} />
                <span>{loading ? 'Creating...' : 'Create Batch'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
