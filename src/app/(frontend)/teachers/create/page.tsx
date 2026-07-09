// src/app/(frontend)/teachers/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserCog,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Award,
  BookOpen,
  ChevronLeft,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'

const STEPS = ['Account', 'Professional', 'Personal', 'Address']

export default function TeacherRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [departments, setDepartments] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Account
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Professional (teacher info)
    department: '',
    designation: '',
    qualification: '',
    joiningDate: '',
    // Personal
    phone: '',
    dateOfBirth: '',
    gender: '',
    cnic: '',
    // Address
    street: '',
    city: '',
    state: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    fetch('/api/departments?limit=100')
      .then((r) => r.json())
      .then((d) => setDepartments(d.docs || []))
      .catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Enter a valid email address'
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters'
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match'
    }

    if (step === 2) {
      if (!formData.department) newErrors.department = 'Department is required'
      if (!formData.designation) newErrors.designation = 'Designation is required'
      if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required'
      if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required'
    }

    if (step === 3) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      if (!formData.gender) newErrors.gender = 'Gender is required'
      if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required'
      else {
        const cleaned = formData.cnic.replace(/-/g, '')
        if (!/^\d+$/.test(cleaned) || cleaned.length !== 13)
          newErrors.cnic = 'CNIC must be 13 digits (e.g. 36300-5419772-3)'
      }
    }

    if (step === 4) {
      if (!formData.street.trim()) newErrors.street = 'Street address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.state.trim()) newErrors.state = 'State is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    setApiError('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'teacher',
          status: 'active',
          teacherInfo: {
            department: formData.department,
            designation: formData.designation,
            qualification: formData.qualification,
            joiningDate: formData.joiningDate,
          },
          personalInfo: {
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            cnic: formData.cnic,
          },
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
          },
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/teachers'), 2000)
      } else {
        setApiError(data.errors?.[0]?.message || data.message || 'Registration failed. Please try again.')
      }
    } catch {
      setApiError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`

  const plainInputClass = (field: string) =>
    `block w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Registered!</h2>
          <p className="text-gray-600 mb-1">The teacher account has been created successfully.</p>
          <p className="text-sm text-gray-400">Redirecting to teachers list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/teachers"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Register Teacher</h1>
                <p className="text-sm text-gray-500">Add a new faculty member</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STEPS.map((label, i) => {
                const isComplete = step > i + 1
                const isActive = step === i + 1
                return (
                  <div key={label} className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-sm ${
                        isComplete
                          ? 'bg-blue-600 text-white'
                          : isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isComplete ? <CheckCircle size={18} /> : i + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive || isComplete ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">
                {step === 1 && 'Account Information'}
                {step === 2 && 'Professional Information'}
                {step === 3 && 'Personal Information'}
                {step === 4 && 'Address Details'}
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {step === 1 && 'Set up login credentials for the teacher'}
                {step === 2 && "Enter the teacher's academic and department details"}
                {step === 3 && "Fill in the teacher's personal information"}
                {step === 4 && "Provide the teacher's residential address"}
              </p>
            </div>

            <div className="p-6">
              {/* API Error */}
              {apiError && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start space-x-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }}>
                {/* ── Step 1: Account ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={inputClass('name')}
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={inputClass('email')}
                          placeholder="teacher@university.edu"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${inputClass('password')} pr-10`}
                            placeholder="Min 6 chars"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`${inputClass('confirmPassword')} pr-10`}
                            placeholder="Re-enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Professional Info ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className={inputClass('department')}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.department && (
                        <p className="mt-1 text-xs text-red-600">{errors.department}</p>
                      )}
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          className={inputClass('designation')}
                        >
                          <option value="">Select Designation</option>
                          <option value="Permanent">Permanent</option>
                          <option value="visiting">Visiting</option>
                        </select>
                      </div>
                      {errors.designation && (
                        <p className="mt-1 text-xs text-red-600">{errors.designation}</p>
                      )}
                    </div>

                    {/* Qualification */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Qualification <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleChange}
                          className={inputClass('qualification')}
                          placeholder="e.g., PhD Computer Science, M.Sc Mathematics"
                        />
                      </div>
                      {errors.qualification && (
                        <p className="mt-1 text-xs text-red-600">{errors.qualification}</p>
                      )}
                    </div>

                    {/* Joining Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Joining Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          name="joiningDate"
                          value={formData.joiningDate}
                          onChange={handleChange}
                          className={`${inputClass('joiningDate')} text-gray-900`}
                        />
                      </div>
                      {errors.joiningDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.joiningDate}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Personal Info ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClass('phone')}
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={`${inputClass('dateOfBirth')} text-gray-900`}
                          />
                        </div>
                        {errors.dateOfBirth && (
                          <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={`${inputClass('gender')} text-gray-900`}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        {errors.gender && (
                          <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
                        )}
                      </div>

                      {/* CNIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          CNIC <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cnic"
                          value={formData.cnic}
                          onChange={handleChange}
                          className={`${plainInputClass('cnic')} font-mono`}
                          placeholder="36300-5419772-3"
                        />
                        {errors.cnic && (
                          <p className="mt-1 text-xs text-red-600">{errors.cnic}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 4: Address ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    {/* Street */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className={inputClass('street')}
                          placeholder="House No, Street, Area"
                        />
                      </div>
                      {errors.street && (
                        <p className="mt-1 text-xs text-red-600">{errors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={plainInputClass('city')}
                          placeholder="Lahore"
                        />
                        {errors.city && (
                          <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                        )}
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={plainInputClass('state')}
                          placeholder="Punjab"
                        />
                        {errors.state && (
                          <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
                        Registration Summary
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-sm text-blue-700">
                        <span className="text-blue-500 font-medium">Name:</span>
                        <span>{formData.name}</span>
                        <span className="text-blue-500 font-medium">Email:</span>
                        <span className="truncate">{formData.email}</span>
                        <span className="text-blue-500 font-medium">Department:</span>
                        <span>
                          {departments.find((d) => d.id === formData.department)?.name || '-'}
                        </span>
                        <span className="text-blue-500 font-medium">Designation:</span>
                        <span>{formData.designation}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-7 flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center space-x-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                  )}

                  {step < 4 ? (
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <span>Next Step</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <UserCog size={18} />
                          <span>Register Teacher</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            <Link href="/teachers" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Teachers List
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
