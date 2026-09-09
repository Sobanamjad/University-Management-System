// src/app/(frontend)/users/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
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
  GraduationCap,
  UserCog,
} from 'lucide-react'

const STEPS = ['Account', 'Role Info', 'Personal', 'Address']

type Role = 'admin' | 'coordinator' | 'teacher' | 'student'

export default function UserCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [departments, setDepartments] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Account
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher' as Role,
    status: 'active',

    // Step 2: Role-specific
    // Teacher fields
    teacherDesignation: '',
    teacherQualification: '',
    teacherJoiningDate: '',
    // Coordinator fields
    coordinatorDepartments: [] as string[],
    coordinatorQualification: '',
    coordinatorJoiningDate: '',

    // Step 3: Personal
    phone: '',
    dateOfBirth: '',
    gender: '',
    cnic: '',

    // Step 4: Address
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

  const handleCoordinatorDeptToggle = (deptId: string) => {
    setFormData((prev) => {
      const current = prev.coordinatorDepartments
      const updated = current.includes(deptId)
        ? current.filter((id) => id !== deptId)
        : [...current, deptId]
      return { ...prev, coordinatorDepartments: updated }
    })
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
      if (!formData.role) newErrors.role = 'Role is required'
    }

    if (step === 2) {
      if (formData.role === 'teacher') {
        if (!formData.teacherDesignation) newErrors.teacherDesignation = 'Designation is required'
        if (!formData.teacherQualification.trim())
          newErrors.teacherQualification = 'Qualification is required'
        if (!formData.teacherJoiningDate) newErrors.teacherJoiningDate = 'Joining date is required'
      }
      if (formData.role === 'coordinator') {
        if (formData.coordinatorDepartments.length === 0)
          newErrors.coordinatorDepartments = 'Select at least one department'
        if (!formData.coordinatorQualification.trim())
          newErrors.coordinatorQualification = 'Qualification is required'
        if (!formData.coordinatorJoiningDate)
          newErrors.coordinatorJoiningDate = 'Joining date is required'
      }
      // Admin and student have no required fields in step 2 — skip
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

    // Build payload based on role
    const body: Record<string, any> = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: formData.status,
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
    }

    if (formData.role === 'teacher') {
      body.teacherInfo = {
        designation: formData.teacherDesignation,
        qualification: formData.teacherQualification,
        joiningDate: formData.teacherJoiningDate,
      }
    }

    if (formData.role === 'coordinator') {
      body.coordinatorInfo = {
        departments: formData.coordinatorDepartments,
        qualification: formData.coordinatorQualification,
        joiningDate: formData.coordinatorJoiningDate,
      }
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/users'), 2000)
      } else {
        setApiError(
          data.errors?.[0]?.message || data.message || 'Failed to create user. Please try again.',
        )
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

  // Step 2 title/subtitle based on role
  const step2Title = () => {
    if (formData.role === 'teacher') return ['Professional Information', "Enter the teacher's academic details"]
    if (formData.role === 'coordinator') return ['Coordinator Information', 'Assign departments and qualifications']
    return ['Role Information', 'No additional information required for this role']
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Created!</h2>
          <p className="text-gray-600 mb-1">The user account has been created successfully.</p>
          <p className="text-sm text-gray-400">Redirecting to users list...</p>
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
              href="/users"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create User</h1>
                <p className="text-sm text-gray-500">Add a new system user</p>
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
                {step === 2 && step2Title()[0]}
                {step === 3 && 'Personal Information'}
                {step === 4 && 'Address Details'}
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {step === 1 && 'Set up login credentials and choose a role'}
                {step === 2 && step2Title()[1]}
                {step === 3 && "Fill in the user's personal information"}
                {step === 4 && "Provide the user's residential address"}
              </p>
            </div>

            <div className="p-6">
              {apiError && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start space-x-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{apiError}</span>
                </div>
              )}

              <form
                onSubmit={
                  step === 4
                    ? handleSubmit
                    : (e) => {
                        e.preventDefault()
                        handleNext()
                      }
                }
              >
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
                          placeholder="e.g., Dr. Ahmed Khan"
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
                          placeholder="user@university.edu"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
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

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(
                          [
                            { value: 'admin', label: 'Admin', icon: '👑' },
                            { value: 'coordinator', label: 'Coordinator', icon: '👔' },
                            { value: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
                            { value: 'student', label: 'Student', icon: '🎓' },
                          ] as const
                        ).map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, role: r.value }))
                            }
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                              formData.role === r.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-2xl mb-1">{r.icon}</span>
                            <span className="text-xs font-semibold">{r.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.role && (
                        <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={plainInputClass('status')}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Role Info ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    {formData.role === 'teacher' && (
                      <>
                        {/* Designation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Designation <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                              name="teacherDesignation"
                              value={formData.teacherDesignation}
                              onChange={handleChange}
                              className={inputClass('teacherDesignation')}
                            >
                              <option value="">Select Designation</option>
                              <option value="Permanent">Permanent</option>
                              <option value="visiting">Visiting</option>
                            </select>
                          </div>
                          {errors.teacherDesignation && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.teacherDesignation}
                            </p>
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
                              name="teacherQualification"
                              value={formData.teacherQualification}
                              onChange={handleChange}
                              className={inputClass('teacherQualification')}
                              placeholder="e.g., PhD Computer Science"
                            />
                          </div>
                          {errors.teacherQualification && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.teacherQualification}
                            </p>
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
                              name="teacherJoiningDate"
                              value={formData.teacherJoiningDate}
                              onChange={handleChange}
                              className={`${inputClass('teacherJoiningDate')} text-gray-900`}
                            />
                          </div>
                          {errors.teacherJoiningDate && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.teacherJoiningDate}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {formData.role === 'coordinator' && (
                      <>
                        {/* Departments */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Assigned Departments <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50 max-h-48 overflow-y-auto">
                            {departments.map((dept) => (
                              <label
                                key={dept.id}
                                className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-all hover:bg-blue-50 ${
                                  formData.coordinatorDepartments.includes(dept.id)
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.coordinatorDepartments.includes(dept.id)}
                                  onChange={() => handleCoordinatorDeptToggle(dept.id)}
                                  className="w-4 h-4 text-blue-600 rounded mr-2.5"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {dept.name}
                                </span>
                              </label>
                            ))}
                            {departments.length === 0 && (
                              <p className="text-xs text-gray-400 italic col-span-full text-center py-4">
                                No departments available
                              </p>
                            )}
                          </div>
                          {errors.coordinatorDepartments && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.coordinatorDepartments}
                            </p>
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
                              name="coordinatorQualification"
                              value={formData.coordinatorQualification}
                              onChange={handleChange}
                              className={inputClass('coordinatorQualification')}
                              placeholder="e.g., PhD Management Sciences"
                            />
                          </div>
                          {errors.coordinatorQualification && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.coordinatorQualification}
                            </p>
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
                              name="coordinatorJoiningDate"
                              value={formData.coordinatorJoiningDate}
                              onChange={handleChange}
                              className={`${inputClass('coordinatorJoiningDate')} text-gray-900`}
                            />
                          </div>
                          {errors.coordinatorJoiningDate && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.coordinatorJoiningDate}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {(formData.role === 'admin' || formData.role === 'student') && (
                      <div className="py-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">
                            {formData.role === 'admin' ? '👑' : '🎓'}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium">
                          No additional role information required for{' '}
                          <span className="font-bold capitalize">{formData.role}</span>.
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click Next to continue.
                        </p>
                      </div>
                    )}
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
                        Summary
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-sm text-blue-700">
                        <span className="text-blue-500 font-medium">Name:</span>
                        <span>{formData.name}</span>
                        <span className="text-blue-500 font-medium">Email:</span>
                        <span className="truncate">{formData.email}</span>
                        <span className="text-blue-500 font-medium">Role:</span>
                        <span className="capitalize">{formData.role}</span>
                        <span className="text-blue-500 font-medium">Status:</span>
                        <span className="capitalize">{formData.status}</span>
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
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating User...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>Create User</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
