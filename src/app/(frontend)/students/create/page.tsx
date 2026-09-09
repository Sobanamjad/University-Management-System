// src/app/(frontend)/students/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  ChevronLeft,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CreditCard,
  Hash,
} from 'lucide-react'

const STEPS = ['Account', 'Personal', 'Academic']

export default function CreateStudentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [departments, setDepartments] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2
    phone: '',
    dateOfBirth: '',
    gender: '',
    cnic: '',
    street: '',
    city: '',
    state: '',
    // Step 3
    rollNo: '',
    batch: '',
    admissionDate: '',
  })

  useEffect(() => {
    // departments no longer needed on create — assigned via enrollment
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateStep = () => {
    const e: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) e.name = 'Full name is required'
      if (!formData.email.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email'
      if (!formData.password) e.password = 'Password is required'
      else if (formData.password.length < 6) e.password = 'Minimum 6 characters'
      if (!formData.confirmPassword) e.confirmPassword = 'Please confirm password'
      else if (formData.password !== formData.confirmPassword)
        e.confirmPassword = 'Passwords do not match'
    }

    if (step === 2) {
      if (!formData.phone.trim()) e.phone = 'Phone number is required'
      if (!formData.dateOfBirth) e.dateOfBirth = 'Date of birth is required'
      if (!formData.gender) e.gender = 'Gender is required'
      if (!formData.cnic.trim()) e.cnic = 'CNIC is required'
      else {
        const cleaned = formData.cnic.replace(/-/g, '')
        if (!/^\d+$/.test(cleaned) || cleaned.length !== 13)
          e.cnic = 'Must be 13 digits (36300-5419772-3)'
      }
      if (!formData.street.trim()) e.street = 'Street is required'
      if (!formData.city.trim()) e.city = 'City is required'
      if (!formData.state.trim()) e.state = 'State is required'
    }

    if (step === 3) {
      if (!formData.rollNo.trim()) e.rollNo = 'Roll number is required'
      if (!formData.batch.trim()) e.batch = 'Batch is required'
      if (!formData.admissionDate) e.admissionDate = 'Admission date is required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1)
  }
  const handleBack = () => {
    setApiError('')
    setStep((s) => s - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return
    setLoading(true)
    setApiError('')

    try {
      // 1. Create user account
      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'student',
          status: 'active',
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

      const userData = await userRes.json()
      if (!userRes.ok) {
        setApiError(
          userData.errors?.[0]?.message || userData.message || 'Failed to create user account',
        )
        setLoading(false)
        return
      }

      const userId = userData.doc?.id || userData.id

      // 2. Create student record
      const studentRes = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: formData.rollNo,
          batch: formData.batch,
          admissionDate: formData.admissionDate,
          user: parseInt(String(userId), 10),
        }),
      })

      const studentData = await studentRes.json()
      if (!studentRes.ok) {
        setApiError(
          studentData.errors?.[0]?.message ||
            studentData.message ||
            'User created but student record failed',
        )
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/students'), 2000)
    } catch {
      setApiError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── field styling helpers ──
  const ic = (field: string) =>
    `block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:ring-red-300 bg-red-50 text-gray-900'
        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 bg-gray-50 text-gray-900'
    }`

  const pc = (field: string) =>
    `block w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:ring-red-300 bg-red-50 text-gray-900'
        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 bg-gray-50 text-gray-900'
    }`

  const err = (field: string) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Student Registered</h2>
          <p className="text-gray-500 text-sm">Redirecting to students list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-30">
        <Link
          href="/students"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mr-3"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
          <GraduationCap size={16} className="text-orange-600" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-none">Register Student</h1>
          <p className="text-xs text-gray-400 mt-0.5">Create user account + student record</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto py-8 px-4">
        {/* ── Step Tracker ── */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => {
            const done = step > i + 1
            const active = step === i + 1
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      done
                        ? 'bg-blue-600 text-white'
                        : active
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {done ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${active || done ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 mb-4 bg-gray-200 relative top-[-8px]">
                    <div
                      className={`h-full bg-blue-600 transition-all ${done ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* card header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-800 text-sm">
              {step === 1 && 'Account Credentials'}
              {step === 2 && 'Personal Information'}
              {step === 3 && 'Academic Details'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 && 'Login email and password for the student'}
              {step === 2 && 'Contact, CNIC and address details'}
              {step === 3 && 'Roll number, batch and admission — department assigned on enrollment'}
            </p>
          </div>

          <div className="p-6">
            {apiError && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            <form
              onSubmit={
                step === 3
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault()
                      handleNext()
                    }
              }
            >
              {/* ─────────── STEP 1: Account ─────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={ic('name')}
                        placeholder="Ali Hassan"
                      />
                    </div>
                    {err('name')}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={ic('email')}
                        placeholder="student@uni.edu"
                      />
                    </div>
                    {err('email')}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`${ic('password')} pr-9`}
                          placeholder="Min 6 chars"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {err('password')}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`${ic('confirmPassword')} pr-9`}
                          placeholder="Repeat"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {err('confirmPassword')}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── STEP 2: Personal ─────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={ic('phone')}
                          placeholder="+92 300 0000000"
                        />
                      </div>
                      {err('phone')}
                    </div>
                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Date of Birth <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className={ic('dateOfBirth')}
                        />
                      </div>
                      {err('dateOfBirth')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Gender <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={ic('gender')}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      {err('gender')}
                    </div>
                    {/* CNIC */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        CNIC <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="cnic"
                          value={formData.cnic}
                          onChange={handleChange}
                          className={`${ic('cnic')} font-mono`}
                          placeholder="36300-0000000-0"
                        />
                      </div>
                      {err('cnic')}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Address
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Street <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className={ic('street')}
                            placeholder="House No, Street, Area"
                          />
                        </div>
                        {err('street')}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            City <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={pc('city')}
                            placeholder="Lahore"
                          />
                          {err('city')}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            State <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={pc('state')}
                            placeholder="Punjab"
                          />
                          {err('state')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── STEP 3: Academic ─────────── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Roll No */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Roll Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="rollNo"
                          value={formData.rollNo}
                          onChange={handleChange}
                          className={ic('rollNo')}
                          placeholder="CS-2024-001"
                        />
                      </div>
                      {err('rollNo')}
                    </div>
                    {/* Batch */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Batch <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        className={pc('batch')}
                        placeholder="2024-2028"
                      />
                      {err('batch')}
                    </div>
                  </div>

                  {/* Admission Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Admission Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="admissionDate"
                        value={formData.admissionDate}
                        onChange={handleChange}
                        className={ic('admissionDate')}
                      />
                    </div>
                    {err('admissionDate')}
                  </div>

                  {/* Info note */}
                  {/* <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <BookOpen size={15} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-semibold">
                        Department &amp; Semester not required here.
                      </span>{' '}
                      Both will be assigned automatically when this student is enrolled in a class
                      from the <span className="font-semibold">Enrollments</span> section.
                    </p>
                  </div> */}

                  {/* Summary */}
                  <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Summary
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-gray-400">Name</span>
                      <span className="text-gray-700 font-medium">{formData.name}</span>
                      <span className="text-gray-400">Email</span>
                      <span className="text-gray-700 font-medium truncate">{formData.email}</span>
                      <span className="text-gray-400">Roll No</span>
                      <span className="text-gray-700 font-medium">{formData.rollNo || '—'}</span>
                      <span className="text-gray-400">Batch</span>
                      <span className="text-gray-700 font-medium">{formData.batch || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Nav Buttons ── */}
              <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Next
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                        Registering...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} /> Register Student
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
  )
}
