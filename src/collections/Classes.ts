// collections/Classes.ts
import { CollectionConfig } from 'payload'

// Helper: ensure a relationship value is a valid numeric ID (handles both number and string forms)
const isValidId = (val: unknown): boolean => {
  if (typeof val === 'number') return !isNaN(val) && val > 0
  if (typeof val === 'string') return !isNaN(Number(val)) && Number(val) > 0
  return false
}
const toId = (val: unknown): number | undefined => {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return val
  if (typeof val === 'string' && !isNaN(Number(val)) && Number(val) > 0) return Number(val)
  return undefined
}

export const Classes: CollectionConfig = {
  slug: 'classes',
  admin: {
    useAsTitle: 'title',
    group: 'Academic',
    defaultColumns: ['title', 'course', 'section', 'teacher', 'days', 'timeSlot'],
    description: 'Manage class sections for courses',
  },
  fields: [
    // ===== 1. BASIC INFO =====
    {
      name: 'title',
      type: 'text',
      label: 'Class Title',
      admin: {
        readOnly: true,
        description: 'Auto-generated from course and section',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.course && data?.section) {
              return `${data.course} - Section ${data.section}`
            }
            return data?.title
          },
        ],
      },
    },
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

    // ===== 2. UNIVERSITY =====
    {
      name: 'university',
      type: 'relationship',
      relationTo: 'universities',
      required: true,
      label: 'University',
    },

    // ===== 3. DEPARTMENT =====
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
    },

    // ===== 4. COURSE =====
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
      filterOptions: ({ data }) => {
        const rawDept =
          typeof data?.department === 'object' ? data.department?.value : data?.department
        const rawUni =
          typeof data?.university === 'object' ? data.university?.value : data?.university
        const deptId = toId(rawDept)
        const uniId = toId(rawUni)
        if (deptId && uniId) {
          return {
            department: { equals: deptId },
            university: { equals: uniId },
          }
        }
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department && data?.university),
      },
    },

    // ===== 5. SEMESTER =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Semester',
      filterOptions: ({ data }) => {
        const rawDept =
          typeof data?.department === 'object' ? data.department?.value : data?.department
        const rawUni =
          typeof data?.university === 'object' ? data.university?.value : data?.university
        const deptId = toId(rawDept)
        const uniId = toId(rawUni)
        if (deptId && uniId) {
          return {
            department: { equals: deptId },
            university: { equals: uniId },
          }
        }
        return true // allow all when context unavailable (prevents server-side rejection)
      },
      admin: {
        condition: (data) => Boolean(data?.department && data?.university),
      },
    },

    // ===== 6. TEACHER =====
    {
      name: 'teacher',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Teacher',
      filterOptions: ({ data }) => {
        const rawDept =
          typeof data?.department === 'object' ? data.department?.value : data?.department
        const deptId = toId(rawDept)
        if (deptId) {
          return {
            role: { equals: 'teacher' },
            'teacherInfo.department': { equals: deptId },
          }
        }
        return true // allow all when context unavailable (prevents server-side rejection)
      },
      admin: {
        condition: (data) => Boolean(data?.department),
      },
    },

    // ===== 7. DAY (Monday to Saturday) =====
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
      admin: {
        width: '50%',
      },
    },

    // ===== 8. TIME SLOT (8 AM to 5 PM, hourly) =====
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
      admin: {
        width: '33%',
        description: 'Select time slot (hourly from 8 AM to 5 PM)',
      },
    },

    // ===== 9. CAPACITY =====
    {
      name: 'maxStudents',
      type: 'number',
      required: true,
      defaultValue: 20,
      label: 'Max Students',
      admin: {
        width: '33%',
      },
    },
    {
      name: 'currentStudents',
      type: 'number',
      defaultValue: 0,
      label: 'Current Students',
      admin: {
        readOnly: true,
        width: '33%',
      },
    },

    // ===== 11. LECTURE TYPE =====
    {
      name: 'lectureType',
      type: 'select',
      required: true,
      defaultValue: 'theory',
      options: [
        { label: 'Theory', value: 'theory' },
        { label: 'Lab', value: 'lab' },
      ],
      admin: {
        width: '33%',
      },
    },

    // ===== 13. STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['course', 'section', 'semester'],
      unique: true,
    },
    // {
    //   fields: ['days', 'timeSlot', 'semester'],
    //   unique: true,
    // },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.course) {
          const course = await req.payload.findByID({
            collection: 'courses',
            id: data.course,
            depth: 0,
          })
          if (course) {
            const extractId = (val: unknown) =>
              val && typeof val === 'object' && 'id' in val ? (val as { id: number }).id : val
            data.department = extractId(course.department)
            data.university = extractId(course.university)
          }
        }
        return data
      },

      async ({ data, req, originalDoc }) => {
        if (data?.day && data?.timeSlot && data?.semester) {
          const existing = await req.payload.find({
            collection: 'classes',
            where: {
              day: { equals: data.day },
              timeSlot: { equals: data.timeSlot },
              semester: { equals: data.semester },
              id: { not_equals: originalDoc?.id || '0' },
            },
          })

          if (existing.docs.length > 0) {
            throw new Error(
              `This slot is already booked on ${data.day} at ${data.timeSlot} in this semester!`,
            )
          }
        }
        return data
      },
    ],

    beforeChange: [
      async ({ data, req }) => {
        if (data?.semester) {
          const semester = await req.payload.findByID({
            collection: 'semesters',
            id: data.semester,
          })
          if (semester) {
            const now = new Date()
            const start = new Date(semester.startDate)
            const end = new Date(semester.endDate)

            if (now < start) {
              data.status = 'scheduled'
            } else if (now > end) {
              data.status = 'completed'
            } else {
              data.status = 'ongoing'
            }
          }
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
