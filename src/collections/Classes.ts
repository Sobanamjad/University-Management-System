// collections/Classes.ts
import { CollectionConfig } from 'payload'

export const Classes: CollectionConfig = {
  slug: 'classes',
  admin: {
    useAsTitle: 'title',
    group: 'University',
    defaultColumns: ['title', 'course', 'section', 'teacher', 'days', 'timeSlot', 'batch'],
    description: 'Manage class sections for courses',
  },
  fields: [
    // ===== 1. TITLE (Auto-generated: "Data Structures - Section A (Fall 2024)") =====
    {
      name: 'title',
      type: 'text',
      label: 'Class Title',
      admin: {
        readOnly: true,
        description: 'Auto-generated: Course Name - Section (Session)',
      },
    },

    // ===== 2. SECTION =====
    {
      name: 'section',
      type: 'text',
      required: true,
      label: 'Section',
      admin: {
        placeholder: 'A, B, C, etc.',
        width: '50%',
      },
    },

    // ===== 3. DEPARTMENT =====
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
    },

    // ===== 4. BATCH =====
    {
      name: 'batch',
      type: 'relationship',
      relationTo: 'batches',
      required: false,
      label: 'Batch',
      admin: {
        description: 'Which batch this class belongs to',
      },
    },

    // ===== 5. COURSE =====
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
      filterOptions: ({ data }) => {
        const deptId = typeof data?.department === 'object' ? data.department?.id : data?.department
        if (deptId) return { department: { equals: deptId } } as any
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department),
      },
    },

    // ===== 6. SEMESTER =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Semester',
      filterOptions: ({ data }) => {
        const deptId = typeof data?.department === 'object' ? data.department?.id : data?.department
        if (deptId) return { department: { equals: deptId } } as any
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department),
      },
    },

    // ===== 7. TEACHER =====
    {
      name: 'teacher',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Teacher',
      filterOptions: {
        role: { equals: 'teacher' },
      },
      admin: {
        condition: (data) => Boolean(data?.department),
      },
    },

    // ===== 8. DAYS =====
    {
      name: 'days',
      type: 'select',
      label: 'Days',
      required: true,
      hasMany: true,
      options: [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
      ],
    },

    // ===== 9. TIME SLOT =====
    {
      name: 'timeSlot',
      type: 'select',
      required: true,
      label: 'Time Slot',
      options: [
        { label: '08:00 - 09:00', value: '08:00-09:00' },
        { label: '09:00 - 10:00', value: '09:00-10:00' },
        { label: '10:00 - 11:00', value: '10:00-11:00' },
        { label: '11:00 - 12:00', value: '11:00-12:00' },
        { label: '12:00 - 13:00', value: '12:00-13:00' },
        { label: '13:00 - 14:00', value: '13:00-14:00' },
        { label: '14:00 - 15:00', value: '14:00-15:00' },
        { label: '15:00 - 16:00', value: '15:00-16:00' },
        { label: '16:00 - 17:00', value: '16:00-17:00' },
        { label: '17:00 - 18:00', value: '17:00-18:00' },
      ],
    },

    // ===== 10. CAPACITY =====
    {
      name: 'currentStudents',
      type: 'number',
      defaultValue: 0,
      label: 'Current Students',
      admin: { readOnly: true },
    },

    // ===== 11. LECTURE TYPE =====
    {
      name: 'lectureType',
      type: 'select',
      required: true,
      defaultValue: 'theory',
      label: 'Lecture Type',
      options: [
        { label: 'Theory', value: 'theory' },
        { label: 'Lab', value: 'lab' },
      ],
    },

    // ===== 12. STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      label: 'Status',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['course', 'section', 'semester'],
      unique: true,
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      // Auto-generate title: "Data Structures - Section A (Fall 2024)"
      async ({ data, req }) => {
        if (data?.course && data?.section) {
          try {
            const course = await req.payload.findByID({
              collection: 'courses',
              id: String(data.course),
              depth: 0,
              overrideAccess: true,
              req,
            })

            // Get session from semester if available
            let session = ''
            if (data?.semester) {
              try {
                const sem = await req.payload.findByID({
                  collection: 'semesters',
                  id: String(data.semester),
                  depth: 0,
                  overrideAccess: true,
                  req,
                })
                session = sem?.session || ''
              } catch {
                // ignore
              }
            }

            const courseName = course?.title || 'Course'
            data.title = session
              ? `${courseName} - Section ${data.section} (${session})`
              : `${courseName} - Section ${data.section}`

            // Also sync department from course
            if (course?.department) {
              const deptId =
                typeof course.department === 'object'
                  ? (course.department as any).id
                  : course.department
              data.department = deptId
            }
          } catch {
            data.title = `Section ${data.section}`
          }
        }
        return data
      },

      // Auto-set status from semester dates
      async ({ data, req }) => {
        if (data?.semester) {
          try {
            const semester = await req.payload.findByID({
              collection: 'semesters',
              id: String(data.semester),
              depth: 0,
              overrideAccess: true,
              req,
            })
            if (semester?.startDate && semester?.endDate) {
              const now = new Date()
              const start = new Date(semester.startDate)
              const end = new Date(semester.endDate)
              if (now < start) data.status = 'scheduled'
              else if (now > end) data.status = 'completed'
              else data.status = 'ongoing'
            }
          } catch {
            // keep user-provided status
          }
        }
        return data
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'coordinator') return true
      if (user?.role === 'teacher') return { teacher: { equals: user.id } }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
