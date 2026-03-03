import { CollectionConfig } from 'payload'

// Helper: ensure a relationship value is a valid numeric ID
const isValidId = (val: unknown): val is number => typeof val === 'number' && !isNaN(val) && val > 0

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    group: 'Academic',
    defaultColumns: [
      'title',
      'code',
      'creditHours',
      'university',
      'department',
      'teacher',
      'semester',
    ],
  },
  fields: [
    // ===== BASIC INFO =====
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Course Title',
      admin: {
        placeholder: 'e.g., Introduction to Computer Science',
      },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: 'Course Code',
      admin: {
        placeholder: 'e.g., CS101',
      },
    },
    {
      name: 'creditHours',
      type: 'number',
      required: true,
      label: 'Credit Hours',
      min: 1,
      max: 6,
    },

    // ===== DEPARTMENT =====
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
      admin: {
        description: 'Select the department (subject)',
      },
    },

    // ===== UNIVERSITY (ADD THIS) =====
    {
      name: 'university',
      type: 'relationship',
      relationTo: 'universities',
      required: true,
      label: 'University',
    },

    // ===== SEMESTER (Filtered by department) =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Semester',
      filterOptions: ({ data }) => {
        const deptId =
          typeof data?.department === 'object' ? data.department?.value : data?.department
        if (isValidId(deptId)) {
          return {
            department: { equals: deptId },
          }
        }
        return false
      },
      admin: {
        condition: (data) => Boolean(data?.department),
        description: 'Semesters filtered by department',
      },
    },

    // ===== TEACHER (Filtered by department) =====
    {
      name: 'teacher',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Course Teacher',
      filterOptions: ({ data }) => {
        const deptId =
          typeof data?.department === 'object' ? data.department?.value : data?.department
        if (isValidId(deptId)) {
          return {
            role: { equals: 'teacher' },
            'teacherInfo.department': { equals: deptId },
          }
        }
        return false
      },
      admin: {
        condition: (data) => Boolean(data?.department),
        description: 'Teachers filtered by department only',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
    {
      fields: ['university'],
    },
    {
      fields: ['department'],
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Validate credit hours
        if (data?.creditHours && (data.creditHours < 1 || data.creditHours > 6)) {
          throw new Error('Credit hours 1-6 ke darmiyan honi chahiye')
        }
        return data
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'coordinator') return true
      if (user?.role === 'teacher') {
        return {
          teacher: { equals: user.id },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
}
