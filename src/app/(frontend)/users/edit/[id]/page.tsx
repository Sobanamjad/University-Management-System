'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Save, 
  Info, 
  Mail, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  Building2,
  GraduationCap
} from 'lucide-react'

export default function UserEditPage() {
  const router = useRouter()
  const { id } = useParams()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
    teacherInfo: {
      department: '',
      designation: 'Permanent',
      qualification: '',
      joiningDate: '',
    },
    coordinatorInfo: {
      department: '',
      qualification: '',
      joiningDate: '',
    },
    personalInfo: {
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      cnic: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, deptRes] = await Promise.all([
          fetch(`/api/users/${id}?depth=0`).then(res => res.json()),
          fetch('/api/departments?limit=100').then(res => res.json())
        ])

        setDepartments(deptRes.docs || [])

        if (userRes.id) {
          setFormData({
            name: userRes.name || '',
            email: userRes.email || '',
            role: userRes.role || '',
            status: userRes.status || 'active',
            teacherInfo: {
              department: userRes.teacherInfo?.department || '',
              designation: userRes.teacherInfo?.designation || 'Permanent',
              qualification: userRes.teacherInfo?.qualification || '',
              joiningDate: userRes.teacherInfo?.joiningDate ? new Date(userRes.teacherInfo.joiningDate).toISOString().split('T')[0] : '',
            },
            coordinatorInfo: {
              department: userRes.coordinatorInfo?.department || '',
              qualification: userRes.coordinatorInfo?.qualification || '',
              joiningDate: userRes.coordinatorInfo?.joiningDate ? new Date(userRes.coordinatorInfo.joiningDate).toISOString().split('T')[0] : '',
            },
            personalInfo: {
              phone: userRes.personalInfo?.phone || '',
              dateOfBirth: userRes.personalInfo?.dateOfBirth ? new Date(userRes.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
              gender: userRes.personalInfo?.gender || 'male',
              cnic: userRes.personalInfo?.cnic || '',
            },
            address: {
              street: userRes.address?.street || '',
              city: userRes.address?.city || '',
              state: userRes.address?.state || '',
            },
          })
        }
      } catch (err) {
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [group, field] = name.split('.')
      setFormData((prev: any) => ({
        ...prev,
        [group]: {
          ...prev[group],
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Prepare data to send (remove role-specific info if not applicable)
    const dataToSend = { ...formData }
    if (dataToSend.role !== 'teacher') delete (dataToSend as any).teacherInfo
    if (dataToSend.role !== 'coordinator') delete (dataToSend as any).coordinatorInfo

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (res.ok) {
        router.push('/users')
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Failed to update user')
      }
    } catch (err) {
      setError('An error occurred during save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Fetching User Records...</p>
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
              href="/users"
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all border border-transparent hover:border-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">Edit Profile</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">User ID: {id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-50/50 border border-blue-50/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-start animate-in fade-in slide-in-from-top-2">
                <Info size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-12">
              {/* Category: Basic Information */}
              <section>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Basic Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">System Role</label>
                    <select
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Account Status</label>
                    <select
                      name="status"
                      required
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Category: Role Specific Information */}
              {(formData.role === 'teacher' || formData.role === 'coordinator') && (
                <section className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-50">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-8 h-8 bg-white text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                      <GraduationCap size={18} />
                    </div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                      {formData.role === 'teacher' ? 'Teacher' : 'Coordinator'} Specific Info
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Assigned Department</label>
                      <select
                        name={formData.role === 'teacher' ? 'teacherInfo.department' : 'coordinatorInfo.department'}
                        required
                        value={formData.role === 'teacher' ? formData.teacherInfo.department : formData.coordinatorInfo.department}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                      >
                        <option value="">Select Department...</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Qualification</label>
                      <input
                        type="text"
                        name={formData.role === 'teacher' ? 'teacherInfo.qualification' : 'coordinatorInfo.qualification'}
                        required
                        value={formData.role === 'teacher' ? formData.teacherInfo.qualification : formData.coordinatorInfo.qualification}
                        onChange={handleInputChange}
                        placeholder="e.g., PhD Computer Science"
                        className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Joining Date</label>
                      <input
                        type="date"
                        name={formData.role === 'teacher' ? 'teacherInfo.joiningDate' : 'coordinatorInfo.joiningDate'}
                        required
                        value={formData.role === 'teacher' ? formData.teacherInfo.joiningDate : formData.coordinatorInfo.joiningDate}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                      />
                    </div>

                    {formData.role === 'teacher' && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Designation</label>
                        <select
                          name="teacherInfo.designation"
                          required
                          value={formData.teacherInfo.designation}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800"
                        >
                          <option value="Permanent">Permanent</option>
                          <option value="visiting">Visiting</option>
                        </select>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Category: Personal Information */}
              <section>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Personal Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <input
                      type="text"
                      name="personalInfo.phone"
                      required
                      value={formData.personalInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Date of Birth</label>
                    <input
                      type="date"
                      name="personalInfo.dateOfBirth"
                      required
                      value={formData.personalInfo.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Gender</label>
                    <select
                      name="personalInfo.gender"
                      required
                      value={formData.personalInfo.gender}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-gray-800"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">CNIC</label>
                    <input
                      type="text"
                      name="personalInfo.cnic"
                      required
                      value={formData.personalInfo.cnic}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>
              </section>

              {/* Category: Address */}
              <section>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Residential Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Street</label>
                    <input
                      type="text"
                      name="address.street"
                      required
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">City</label>
                    <input
                      type="text"
                      name="address.city"
                      required
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">State</label>
                    <input
                      type="text"
                      name="address.state"
                      required
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Form Footer Actions */}
            <div className="mt-16 pt-10 border-t border-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-100"
              >
                {saving ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    <span>Update Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
