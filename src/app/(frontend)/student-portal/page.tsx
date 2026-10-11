'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, BookOpen, Calendar, DollarSign, TrendingUp, Award } from 'lucide-react'

export default function StudentPortalPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchStudentData = useCallback(async () => {
    try {
      const userRes = await fetch('/api/users/me', { credentials: 'include' })
      const userData = await userRes.json()

      if (!userData.user || userData.user.role !== 'student') {
        router.push('/dashboard')
        return
      }

      setUser(userData.user)

      // Fetch student record linked to this user
      const studentRes = await fetch(
        `/api/students?where[user][equals]=${userData.user.id}&depth=2`,
      )
      const studentData = await studentRes.json()

      if (studentData.docs && studentData.docs.length > 0) {
        setStudent(studentData.docs[0])
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchStudentData()
  }, [fetchStudentData])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Student record not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Student Portal</h1>
            <p className="text-sm font-medium text-gray-500">Welcome, {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{student.displayTitle}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {student.status}
                  </span>
                  {student.batch && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {student.batch.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'grades', label: 'Grades', icon: Award },
              { id: 'fees', label: 'Fees', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Current Semester</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {student.semester?.name || 'Not Assigned'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Batch</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {student.batch?.name || 'Not Assigned'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Admission Date</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {student.admissionDate
                  ? new Date(student.admissionDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award size={20} className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Status</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{student.status}</p>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Attendance</h3>
            <p className="text-gray-600">Attendance records will be displayed here.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                This feature will show your attendance history for all enrolled classes.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Grades</h3>
            <p className="text-gray-600">Academic grades will be displayed here.</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                This feature will show your exam results and GPA history.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Status</h3>
            <p className="text-gray-600">Fee payment history will be displayed here.</p>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">
                This feature will show your fee structure and payment history.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
