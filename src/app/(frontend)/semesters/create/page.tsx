// src/app/(frontend)/semesters/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Save } from 'lucide-react'

export default function CreateSemesterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])

  const [formData, setFormData] = useState({
    session: '',
    semesterNumber: '1',
    department: '' as number | string,
    batch: '' as number | string,
    startDate: '',
    endDate: '',
    isActive: false,
  })

  // Pre-fill from URL params (e.g. coming from batch detail page)
  useEffect(() => {
    const batchParam = searchParams.get('batch')
    const deptParam = searchParams.get('department')
    if (batchParam || deptParam) {
      setFormData((prev) => ({
        ...prev,
        ...(batchParam && { batch: Number(batchParam) }),
        ...(deptParam && { department: Number(deptParam) }),
      }))
    }
  }, [searchParams])

  // Fetch departments and batches
  useEffect(() => {
    Promise.all([
      fetch('/api/departments?limit=100').then((r) => r.json()),
      fetch('/api/batches?limit=100&where[status][equals]=active&sort=-startYear').then((r) =>
        r.json(),
      ),
    ]).then(([depts, batchData]) => {
      setDepartments(depts.docs || [])
      setBatches(batchData.docs || [])
    })
  }, [])

  // When batch changes → auto-fill department and semesterNumber
  const handleBatchChange = (batchId: string) => {
    const batch = batches.find((b) => String(b.id) === batchId)
    if (batch) {
      setFormData((prev) => ({
        ...prev,
        batch: Number(batchId),
        department: Number(
          typeof batch.department === 'object' ? batch.department.id : batch.department,
        ),
        semesterNumber: String(batch.currentSemesterNumber || '1'),
        session: batch.session || prev.session,
      }))
    } else {
      setFormData((prev) => ({ ...prev, batch: batchId ? Number(batchId) : '' }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value

    if (name === 'batch') {
      handleBatchChange(value as string)
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'department' ? (value ? Number(value) : '') : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Remove empty optional fields
    const payload: any = {
      session: formData.session,
      semesterNumber: formData.semesterNumber,
      department: formData.department,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    }
    if (formData.batch) payload.batch = formData.batch

    try {
      const res = await fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/semesters')
      } else {
        const data = await res.json()
        console.error('Semester create error:', JSON.stringify(data, null, 2))
        setError(data.errors?.[0]?.message || 'Failed to create semester')
      }
    } catch {
      setError('An error occurred while creating the semester.')
    } finally {
      setLoading(false)
    }
  }

  const selectedBatch = batches.find((b) => String(b.id) === String(formData.batch))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center space-x-4">
          <Link href="/semesters" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Semester</h1>
            <p className="text-sm text-gray-600">Create a new university semester</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Batch preview */}
            {selectedBatch && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">
                  Linked Batch
                </p>
                <p className="text-base font-bold text-blue-800">{selectedBatch.name}</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Current Semester: {selectedBatch.currentSemesterNumber} /{' '}
                  {selectedBatch.totalSemesters}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Batch — select first, auto-fills rest */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch{' '}
                  <span className="text-gray-400 font-normal text-xs">
                    (optional but recommended)
                  </span>
                </label>
                <select
                  name="batch"
                  value={String(formData.batch)}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Batch (auto-fills department & semester no.)</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — Sem {b.currentSemesterNumber}/{b.totalSemesters}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session & Semester Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="session"
                    required
                    value={formData.session}
                    onChange={handleChange}
                    placeholder="e.g. Fall 2024, Spring 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester Number <span className="text-red-500">*</span>
                    {formData.batch && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                        🔒 locked from batch
                      </span>
                    )}
                  </label>
                  <select
                    name="semesterNumber"
                    required
                    value={formData.semesterNumber}
                    onChange={handleChange}
                    disabled={!!formData.batch}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n.toString()}>
                        {n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                  {formData.batch && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">
                      🔒 locked from batch
                    </span>
                  )}
                </label>
                {formData.batch ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 text-sm">
                    {departments.find((d) => String(d.id) === String(formData.department))?.name ||
                      'Loading...'}
                  </div>
                ) : (
                  <select
                    name="department"
                    required
                    value={String(formData.department)}
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
                )}
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
              <div className="flex items-center pt-2">
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
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Save size={18} />
                <span>{loading ? 'Creating...' : 'Save Semester'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
