// src/app/(frontend)/students/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  User,
  Calendar,
  Hash,
} from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [departmentFilter, setDepartmentFilter] = useState('all')

  useEffect(() => {
    fetchStudents()
  }, [page, search, departmentFilter])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const where: any = {}
      if (search || departmentFilter !== 'all') {
        const and: any[] = []
        if (search) and.push({ rollNo: { like: search } })
        if (departmentFilter !== 'all') and.push({ department: { equals: departmentFilter } })
        where.and = and
      }

      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        depth: '2',
        ...(Object.keys(where).length && { where: JSON.stringify(where) }),
      })

      const res = await fetch(`/api/students?${query}`)
      const data = await res.json()
      setStudents(data.docs)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 flex items-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <p className="text-sm text-gray-600">Manage student records</p>
              </div>
            </div>
            <Link
              href="/students/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Student</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student: any) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.user?.name}</h3>
                    <p className="text-sm text-gray-500">Roll No: {student.rollNo}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span> {student.department?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Semester:</span> {student.semester?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Batch:</span> {student.batch}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {student.status}
                </span>
                <div className="flex space-x-2">
                  <Link
                    href={`/students/${student.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/students/edit/${student.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
                  >
                    <Edit size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
