// src/app/(frontend)/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ChatBot from '@/components/ChatBot'
import {
  Menu,
  X,
  Home,
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
  UserCog,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  CheckSquare,
  BarChart,
  DollarSign,
  ClipboardList,
  Award,
  FileText,
} from 'lucide-react'

// ─── Role type ────────────────────────────────────────────────────────────────
type Role = 'admin' | 'coordinator' | 'teacher' | 'accountant' | 'student'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  /** Roles that CAN see this item. Empty = everyone sees it. */
  roles?: Role[]
  /** Sub-items for grouped sections */
  children?: Omit<NavItem, 'children'>[]
}

// ─── Navigation definition (role-based) ──────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  // ── Always visible ──────────────────────────────────────────────────────────
  { name: 'Dashboard', href: '/dashboard', icon: Home },

  // ── Student only ────────────────────────────────────────────────────────────
  { name: 'My Portal', href: '/student-portal', icon: User, roles: ['student'] },

  // ── Academic management (admin, coordinator, teacher) ───────────────────────
  { name: 'Departments', href: '/departments', icon: Layers, roles: ['admin', 'coordinator'] },
  { name: 'Batches', href: '/batches', icon: BookMarked, roles: ['admin', 'coordinator'] },
  { name: 'Semesters', href: '/semesters', icon: Calendar, roles: ['admin', 'coordinator'] },
  { name: 'Courses', href: '/courses', icon: BookOpen, roles: ['admin', 'coordinator', 'teacher'] },
  { name: 'Classes', href: '/classes', icon: Clock, roles: ['admin', 'coordinator', 'teacher'] },
  {
    name: 'Timetable',
    href: '/timetable',
    icon: BookMarked,
    roles: ['admin', 'coordinator', 'teacher', 'student'],
  },

  // ── People management ───────────────────────────────────────────────────────
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Teachers', href: '/teachers', icon: UserCog, roles: ['admin', 'coordinator'] },
  {
    name: 'Students',
    href: '/students',
    icon: GraduationCap,
    roles: ['admin', 'coordinator', 'teacher'],
  },
  {
    name: 'Enrollments',
    href: '/enrollments',
    icon: UserCheck,
    roles: ['admin', 'coordinator', 'teacher'],
  },

  // ── Attendance ──────────────────────────────────────────────────────────────
  {
    name: 'Attendance',
    href: '/attendance',
    icon: CheckSquare,
    roles: ['admin', 'coordinator', 'teacher'],
  },
  {
    name: 'Attendance Reports',
    href: '/attendance/reports',
    icon: BarChart,
    roles: ['admin', 'coordinator', 'teacher'],
  },

  // ── Exams & Grades ──────────────────────────────────────────────────────────
  {
    name: 'Exams',
    href: '/exams',
    icon: ClipboardList,
    roles: ['admin', 'coordinator', 'teacher', 'student'],
  },
  {
    name: 'Grades',
    href: '/grades',
    icon: Award,
    roles: ['admin', 'coordinator', 'teacher', 'student'],
  },

  // ── Finance ─────────────────────────────────────────────────────────────────
  {
    name: 'Fee Structure',
    href: '/fee-structure',
    icon: FileText,
    roles: ['admin', 'coordinator', 'accountant'],
  },
  {
    name: 'Fee Payments',
    href: '/fee-payments',
    icon: DollarSign,
    roles: ['admin', 'coordinator', 'accountant'],
  },
  {
    name: 'Teacher Salary',
    href: '/teacher-salary',
    icon: Banknote,
    roles: ['admin', 'accountant'],
  },
]

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userLoaded, setUserLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setUserLoaded(true)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Filter nav items based on role
  const visibleNav = NAV_ITEMS.filter((item) => {
    if (!userLoaded) {
      // While loading: show only items with no role restriction (public ones)
      return !item.roles
    }
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.includes(user?.role as Role)
  })
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/'

  if (isAuthPage) {
    return <>{children}</>
  }

  // Role display helpers
  const getRoleBadge = (role: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
      coordinator: { bg: 'bg-blue-100', text: 'text-blue-700' },
      teacher: { bg: 'bg-green-100', text: 'text-green-700' },
      accountant: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      student: { bg: 'bg-orange-100', text: 'text-orange-700' },
    }
    return map[role] || { bg: 'bg-gray-100', text: 'text-gray-700' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo header */}
          <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-base leading-none block">UMS</span>
                <span className="text-xs text-gray-400 leading-none">University Portal</span>
              </div>
            </div>
            {/* Close button (mobile only) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User badge */}
          {userLoaded && user && (
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getRoleBadge(user.role).bg} ${getRoleBadge(user.role).text}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {visibleNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    size={18}
                    className={
                      isActive ? 'text-white flex-shrink-0' : 'text-gray-400 flex-shrink-0'
                    }
                  />
                  <span className="font-medium truncate">{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto flex-shrink-0" />}
                </Link>
              )
            })}
          </nav>

          {/* Footer: settings + logout */}
          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <div className="flex items-center space-x-3">
                  <Settings size={18} className="text-gray-400" />
                  <span className="font-medium">Settings</span>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-gray-400 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {settingsOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <User size={16} className="text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <Settings size={16} className="text-gray-400" />
                    <span>Preferences</span>
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'coordinator') && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setSettingsOpen(false)}
                    >
                      <UserCog size={16} className="text-gray-400" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">{children}</div>
      <ChatBot />
    </div>
  )
}
