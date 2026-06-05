// src/app/(frontend)/layout.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ChatBot from '@/components/ChatBot'
import {
  Menu,
  X,
  Home,
  Building2,
  Layers,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Clock,
  UserCheck,
  BookMarked,
  Settings,
  Banknote,
} from 'lucide-react'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Departments', href: '/departments', icon: Layers },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Semesters', href: '/semesters', icon: Calendar },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Classes', href: '/classes', icon: Clock },
    { name: 'Enrollments', href: '/enrollments', icon: UserCheck },
    { name: 'Timetable', href: '/timetable', icon: BookMarked },
    { name: 'Teacher Salary', href: '/teacher-salary', icon: Banknote },
  ]
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        <Menu size={24} />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 px-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <span className="font-bold text-xl">UMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600">Welcome to</p>
            <p className="font-semibold text-gray-900">Academic Management System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:ml-64 min-h-screen">{children}</div>
      <ChatBot />
    </div>
  )
}
