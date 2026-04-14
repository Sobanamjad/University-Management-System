'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Banknote, Save, Info, User, Calendar, CreditCard } from 'lucide-react'

export default function EditTeacherSalaryPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [teachers, setTeachers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    teacher: '',
    teacherType: 'permanent',
    fixedSalary: 0,
    perClassRate: 0,
    bonus: 0,
    deductions: {
      tax: 0,
      otherDeduction: 0,
    },
    effectiveFrom: '',
    status: 'active',
  })

  // Fetch initial data: Teachers and the record itself
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, recordRes] = await Promise.all([
          fetch('/api/users?limit=100&where[role][equals]=teacher').then(res => res.json()),
          fetch(`/api/teacher-salary/${id}?depth=1`).then(res => res.json())
        ])

        setTeachers(teachersRes.docs || [])
        
        if (recordRes.id) {
          // Format date for the input
          const formattedDate = recordRes.effectiveFrom 
            ? new Date(recordRes.effectiveFrom).toISOString().split('T')[0]
            : ''

          setFormData({
            teacher: recordRes.teacher?.id || recordRes.teacher || '',
            teacherType: recordRes.teacherType || 'permanent',
            fixedSalary: recordRes.fixedSalary || 0,
            perClassRate: recordRes.perClassRate || 0,
            bonus: recordRes.bonus || 0,
            deductions: {
              tax: recordRes.deductions?.tax || 0,
              otherDeduction: recordRes.deductions?.otherDeduction || 0,
            },
            effectiveFrom: formattedDate,
            status: recordRes.status || 'active',
          })
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load salary record.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: Number(value),
        },
      }))
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: ['teacher', 'teacherType', 'status', 'effectiveFrom'].includes(name) ? value : Number(value) 
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/teacher-salary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/teacher-salary')
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Failed to update salary record.')
      }
    } catch (err) {
      setError('An error occurred while updating the record.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading Payroll Data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center shadow-sm">
        <div className="max-w-4xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/teacher-salary"
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all flex items-center justify-center border border-transparent h-10 w-10 hover:border-gray-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">Edit Salary Record</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Record ID: {id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-50/50 border border-indigo-50/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-start">
                <Info size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-10">
              {/* Category: Faculty Selection */}
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Faculty Selection</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 text-gray-400">
                    <label className="text-sm font-bold text-gray-700 ml-1">Assigned Teacher</label>
                    <select
                      name="teacher"
                      disabled
                      value={formData.teacher}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-semibold text-gray-400 cursor-not-allowed"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] font-bold text-gray-400 ml-1 italic">Teacher cannot be changed after creation</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Appointment Type</label>
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, teacherType: 'permanent' }))}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${formData.teacherType === 'permanent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Permanent
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, teacherType: 'visiting' }))}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${formData.teacherType === 'visiting' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Visiting
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Category: Pay Scale */}
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Pay Scale Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formData.teacherType === 'permanent' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Fixed Monthly Salary (Rs.)</label>
                      <input
                        type="number"
                        name="fixedSalary"
                        required
                        value={formData.fixedSalary}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Per Class Rate (Rs.)</label>
                      <input
                        type="number"
                        name="perClassRate"
                        required
                        value={formData.perClassRate}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Monthly Bonus (Rs.)</label>
                    <input
                      type="number"
                      name="bonus"
                      value={formData.bonus}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>
              </section>

              {/* Category: Deductions (Permanent Only) */}
              {formData.teacherType === 'permanent' && (
                <section className="p-6 bg-red-50/30 rounded-[1.5rem] border border-red-50">
                  <div className="flex items-center space-x-3 mb-6">
                    <h2 className="text-xs font-black text-red-500 uppercase tracking-widest">Deductions (Monthly)</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Income Tax (Rs.)</label>
                      <input
                        type="number"
                        name="deductions.tax"
                        value={formData.deductions.tax}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-white border border-red-100 rounded-xl focus:ring-4 focus:ring-red-50 outline-none transition-all font-bold text-red-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Other Deductions (Rs.)</label>
                      <input
                        type="number"
                        name="deductions.otherDeduction"
                        value={formData.deductions.otherDeduction}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-white border border-red-100 rounded-xl focus:ring-4 focus:ring-red-50 outline-none transition-all font-bold text-red-600"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Category: Administration */}
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Administration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Effective From</label>
                    <input
                      type="date"
                      name="effectiveFrom"
                      required
                      value={formData.effectiveFrom}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-gray-700 hover:border-gray-200 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Payroll Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="mt-16 pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-sm text-gray-400 font-medium">
                Last modified directly via Payroll Controller
              </div>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <Link
                  href="/teacher-salary"
                  className="flex-1 md:flex-none text-center px-8 py-4 text-gray-500 font-bold hover:text-gray-800 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-3 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Update Payroll</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
