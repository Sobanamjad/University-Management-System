'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Filter,
  Users,
  Building2,
  BookMarked,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileSpreadsheet,
} from 'lucide-react'
import Link from 'next/link'
import TimetableEntry from './TimetableEntry'

const DAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
]

const TIME_SLOTS = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
]

export default function TimetablePage() {
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<'class' | 'teacher'>('class')
  const [timetableData, setTimetableData] = useState<any[]>([])

  // Filters
  const [semesters, setSemesters] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedTarget, setSelectedTarget] = useState('') // Can be Class ID or Teacher ID

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSemester && selectedTarget) {
      fetchTimetable()
    }
  }, [selectedSemester, selectedTarget, viewType])

  const fetchInitialData = async () => {
    try {
      const [semRes, classRes, teacherRes] = await Promise.all([
        fetch('/api/semesters?limit=100').then((res) => res.json()),
        fetch('/api/classes?limit=100').then((res) => res.json()),
        fetch('/api/users?where[role][equals]=teacher&limit=100').then((res) => res.json()),
      ])

      setSemesters(semRes.docs || [])
      setClasses(classRes.docs || [])
      setTeachers(teacherRes.docs || [])

      if (semRes.docs?.length > 0) {
        setSelectedSemester(semRes.docs[0].id)
      }

      if (viewType === 'class' && classRes.docs?.length > 0) {
        setSelectedTarget(classRes.docs[0].id)
      } else if (viewType === 'teacher' && teacherRes.docs?.length > 0) {
        setSelectedTarget(teacherRes.docs[0].id)
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimetable = async () => {
    setLoading(true)
    try {
      const where: any = {
        and: [{ semester: { equals: selectedSemester } }],
      }

      if (viewType === 'class') {
        where.and.push({ class: { equals: selectedTarget } })
      } else {
        where.and.push({ teacher: { equals: selectedTarget } })
      }

      const query = new URLSearchParams({
        where: JSON.stringify(where),
        limit: '100',
        depth: '2',
      })

      const res = await fetch(`/api/timetable?${query}`)
      const data = await res.json()
      setTimetableData(data.docs || [])
    } catch (error) {
      console.error('Error fetching timetable:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEntryForSlot = (day: string, slot: string) => {
    return timetableData.find((item) => item.day === day && item.timeSlot === slot)
  }

  // Handle Target selection when switching view type
  const handleViewTypeChange = (type: 'class' | 'teacher') => {
    setViewType(type)
    if (type === 'class' && classes.length > 0) {
      setSelectedTarget(classes[0].id)
    } else if (type === 'teacher' && teachers.length > 0) {
      setSelectedTarget(teachers[0].id)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Academic Timetable
              </h1>
              <p className="text-sm font-medium text-gray-500">Academic Schedule Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium border border-gray-200">
              <Printer size={18} />
              <span>Print Schedule</span>
            </button>
            <Link
              href="/admin/collections/timetable/create"
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md shadow-blue-100"
            >
              <Plus size={20} />
              <span>Add Entry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Semester Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Semester
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm font-semibold text-gray-700 min-w-[200px]"
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                  View By
                </label>
                <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                  <button
                    onClick={() => handleViewTypeChange('class')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      viewType === 'class'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Class
                  </button>
                  <button
                    onClick={() => handleViewTypeChange('teacher')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      viewType === 'teacher'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Select {viewType === 'class' ? 'Class' : 'Teacher'}
                </label>
                <div className="relative">
                  {viewType === 'class' ? (
                    <Users
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  ) : (
                    <Building2
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  )}
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm font-semibold text-gray-700 min-w-[240px]"
                  >
                    {viewType === 'class'
                      ? classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.title}
                          </option>
                        ))
                      : teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">
                <Filter size={20} />
              </button>
              <button className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">
                <FileSpreadsheet size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium animate-pulse">Syncing schedule data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-gray-50/80 backdrop-blur-md border-b-2 border-gray-100">
                    <th className="w-24 p-5 text-center bg-white border-r border-gray-100">
                      <div className="flex flex-col items-center">
                        <Clock className="text-blue-500 mb-1" size={20} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          Time
                        </span>
                      </div>
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day.value}
                        className="p-5 text-left border-r border-gray-100 last:border-r-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-gray-900">{day.label}</span>
                          <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-widest">
                            Full Day
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot, rowIndex) => (
                    <tr key={slot} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 text-center border-r border-b border-gray-100 bg-gray-50/30">
                        <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm whitespace-nowrap">
                          {slot}
                        </span>
                      </td>
                      {DAYS.map((day) => {
                        const entry = getEntryForSlot(day.value, slot)
                        return (
                          <td
                            key={`${day.value}-${slot}`}
                            className="p-2 border-r border-b border-gray-100 last:border-r-0 align-top min-h-[120px] w-1/6"
                          >
                            {entry ? (
                              <TimetableEntry entry={entry} viewType={viewType} />
                            ) : (
                              <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-transparent group-hover:border-gray-100 rounded-xl transition-all">
                                <span className="text-[10px] text-transparent group-hover:text-gray-300 font-medium uppercase tracking-widest">
                                  Available
                                </span>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
