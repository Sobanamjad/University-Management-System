// src/app/(frontend)/classes/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, AlertCircle, CheckCircle } from 'lucide-react'

export default function ClassEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    section: '',
    university: '',
    department: '',
    course: '',
    semester: '',
    teacher: '',
    days: [] as string[],
    timeSlot: '',
    maxStudents: 20,
    lectureType: 'theory',
    status: 'scheduled',
  })
  
  const [universities, setUniversities] = useState([])
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    fetchClassData()
    fetchOptions()
  }, [id])

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/classes/${id}?depth=2`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          section: data.section || '',
          university: data.university?.id || '',
          department: data.department?.id || '',
          course: data.course?.id || '',
          semester: data.semester?.id || '',
          teacher: data.teacher?.id || '',
          days: data.days || [],
          timeSlot: data.timeSlot || '',
          maxStudents: data.maxStudents || 20,
          lectureType: data.lectureType || 'theory',
          status: data.status || 'scheduled',
        })
      } else {
        setError('Failed to fetch class data')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [uniRes, deptRes, courseRes, semRes, teacherRes] = await Promise.all([
        fetch('/api/universities?limit=100'),
        fetch('/api/departments?limit=100'),
        fetch('/api/courses?limit=100'),
        fetch('/api/semesters?limit=100'),
        fetch('/api/users?where[role][equals]=teacher&limit=100'),
      ])
      
      const universitiesData = await uniRes.json()
      const departmentsData = await deptRes.json()
      const coursesData = await courseRes.json()
      const semestersData = await semRes.json()
      const teachersData = await teacherRes.json()
      
      setUniversities(universitiesData.docs || [])
      setDepartments(departmentsData.docs || [])
      setCourses(coursesData.docs || [])
      setSemesters(semestersData.docs || [])
      setTeachers(teachersData.docs || [])
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        setSuccess('Class updated successfully!')
        setTimeout(() => router.push('/classes'), 1500)
      } else {
        const errorData = await res.json()
        setError(errorData.message || 'Failed to update class')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const daysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 flex items-center shadow-sm">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/classes" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Edit Class</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
            <CheckCircle size={20} className="mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., A, B, C"
                required
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select University</option>
                {universities.map((uni: any) => (
                  <option key={uni.id} value={uni.id}>{uni.name}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={formData.semester