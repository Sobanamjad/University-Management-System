'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Briefcase,
  GraduationCap,
  Building2,
  Clock,
  ShieldCheck,
  Edit,
} from 'lucide-react'

export default function TeacherViewPage() {
  const { id } = useParams()
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/users/${id}?depth=2`)
        if (res.ok) {
          const data = await res.json()
          if (data.role === 'teacher' || data.role === 'coordinator') {
            setTeacher(data)
          } else {
            setError('User is not a teacher or coordinator')
          }
        } else {
          setError('Teacher not found')
        }
      } catch (err) {
        setError('An error occurred while fetching teacher data')
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">
          Loading Profile...
        </p>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-8">{error || 'Something went wrong'}</p>
          <Link
            href="/teachers"
            className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all"
          >
            Return to Teachers
          </Link>
        </div>
      </div>
    )
  }

  const roleConfig = teacher.role === 'coordinator'
    ? { icon: '👔', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700' }
    : { icon: '👨‍🏫', color: 'green', bg: 'bg-green-100', text: 'text-green-700' }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center shadow-sm">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/teachers"
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all border border-transparent hover:border-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <div
              className={`w-10 h-10 ${roleConfig.bg} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <span className="text-xl">{roleConfig.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {teacher.role === 'coordinator' ? 'Coordinator Profile' : 'Teacher Profile'}
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                {teacher.role === 'coordinator' ? 'University Coordinator' : 'Faculty Member'}
              </p>
            </div>
          </div>
          <Link
            href={`/teachers/edit/${teacher.id}`}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            <Edit size={18} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-50/50 border border-blue-50/50 overflow-hidden relative">
          <div
            className={`h-32 bg-gradient-to-r ${
              teacher.role === 'coordinator' ? 'from-blue-600 to-indigo-600' : 'from-green-600 to-teal-600'
            }`}
          ></div>
          <div className="px-10 pb-10">
            <div className="relative -mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8">
                <div className="w-32 h-32 bg-white rounded-3xl p-1.5 shadow-2xl">
                  <div className="w-full h-full bg-gray-50 rounded-[1.25rem] flex items-center justify-center">
                    <span className="text-6xl">{roleConfig.icon}</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-1">
                    <h2 className="text-3xl font-black text-gray-900">{teacher.name}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {teacher.status === 'active' ? '✅ Active' : '⭕ Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 font-medium text-sm">
                    <div className="flex items-center tracking-tight">
                      <Mail size={14} className="mr-1.5 text-blue-500" />
                      {teacher.email}
                    </div>
                    {teacher.personalInfo?.phone && (
                      <div className="flex items-center tracking-tight">
                        <Phone size={14} className="mr-1.5 text-blue-500" />
                        {teacher.personalInfo.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center justify-center px-6 py-3 rounded-2xl border ${roleConfig.bg} ${roleConfig.text}`}
              >
                <ShieldCheck size={18} className="mr-2" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {teacher.role === 'coordinator' ? 'University Coordinator' : 'Faculty Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Personal info & Address */}
          <div className="lg:col-span-1 space-y-10">
            {/* Address Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-50/50 border border-blue-50/50">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Address Information
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Street Address
                  </p>
                  <p className="font-bold text-gray-900">
                    {teacher.address?.street || 'Not provided'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      City
                    </p>
                    <p className="font-bold text-gray-900">{teacher.address?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      State/Province
                    </p>
                    <p className="font-bold text-gray-900">{teacher.address?.state || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-50/50 border border-blue-50/50">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <User size={18} />
                </div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Personal Information
                </h3>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Gender
                    </p>
                    <p className="font-bold text-gray-900 capitalize">
                      {teacher.personalInfo?.gender || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Date of Birth
                    </p>
                    <p className="font-bold text-gray-900">
                      {teacher.personalInfo?.dateOfBirth
                        ? new Date(teacher.personalInfo.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    CNIC Number
                  </p>
                  <p className="font-mono font-bold text-lg text-indigo-600">
                    {teacher.personalInfo?.cnic || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Role Specific Information */}
          <div className="lg:col-span-2 space-y-10">
            {/* COORDINATOR SECTION */}
            {teacher.role === 'coordinator' && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-50/50 border border-blue-50/50">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Briefcase size={22} />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Coordinator Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <Building2 size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Assigned Departments
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {teacher.coordinatorInfo?.departments?.map((dept: any) => (
                            <span
                              key={typeof dept === 'object' ? dept.id : dept}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-100"
                            >
                              {typeof dept === 'object' ? dept.name : dept}
                            </span>
                          ))}
                          {(!teacher.coordinatorInfo?.departments || teacher.coordinatorInfo.departments.length === 0) && (
                            <p className="text-xl font-black text-gray-900">N/A</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <GraduationCap size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Qualification
                        </p>
                        <p className="text-lg font-bold text-gray-900 leading-snug">
                          {teacher.coordinatorInfo?.qualification || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <Clock size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Joining Date
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {teacher.coordinatorInfo?.joiningDate
                            ? new Date(teacher.coordinatorInfo.joiningDate).toLocaleDateString(
                                'en-US',
                                { day: 'numeric', month: 'long', year: 'numeric' },
                              )
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER SECTION */}
            {teacher.role === 'teacher' && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-50/50 border border-blue-50/50">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                    <Briefcase size={22} />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Teacher Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <CreditCard size={24} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Designation
                        </p>
                        <p className="text-xl font-black text-indigo-600 capitalize">
                          {teacher.teacherInfo?.designation || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <GraduationCap size={24} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Qualification
                        </p>
                        <p className="text-lg font-bold text-gray-900 leading-snug">
                          {teacher.teacherInfo?.qualification || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <Clock size={24} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Joining Date
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {teacher.teacherInfo?.joiningDate
                            ? new Date(teacher.teacherInfo.joiningDate).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Information */}
            <div className="bg-gray-100/50 p-8 rounded-[2rem] border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-white text-gray-400 rounded-xl flex items-center justify-center border border-gray-100">
                  <Clock size={16} />
                </div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  System Information
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Account Created
                  </p>
                  <p className="text-sm font-bold text-gray-600">
                    {new Date(teacher.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm font-bold text-gray-600">
                    {new Date(teacher.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
