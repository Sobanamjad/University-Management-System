// collections/Attendance.ts
import { CollectionConfig } from 'payload'

export const Attendance: CollectionConfig = {
  slug: 'attendance',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Academic',
    defaultColumns: ['displayTitle', 'student', 'class', 'date', 'status'],
    description: 'Track student attendance for classes',
  },
  fields: [
    // ===== DISPLAY TITLE (Auto-generated) =====
    {
      name: 'displayTitle',
      type: 'text',
      label: 'Attendance Record',
      admin: {
        readOnly: true,
        description: 'Auto-generated: Student - Class - Date',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            if (data?.student && data?.class && data?.date) {
              try {
                const student = await req.payload.findByID({
                  collection: 'students',
                  id: data.student,
                  depth: 0,
                  req,
                })
                const classDoc = await req.payload.findByID({
                  collection: 'classes',
                  id: data.class,
                  depth: 0,
                  req,
                })
                return `${student?.displayTitle || 'Student'} - ${classDoc?.title || 'Class'} - ${data.date}`
              } catch {
                return `${data.student} - ${data.class} - ${data.date}`
              }
            }
            return data?.displayTitle || ''
          },
        ],
      },
    },

    // ===== STUDENT =====
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      label: 'Student',
      admin: {
        description: 'Select student',
      },
    },

    // ===== CLASS =====
    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      label: 'Class',
      admin: {
        description: 'Select class',
      },
    },

    // ===== DATE =====
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Attendance Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Date of the class',
      },
    },

    // ===== STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'present',
      label: 'Attendance Status',
      options: [
        { label: 'Present', value: 'present' },
        { label: 'Absent', value: 'absent' },
        { label: 'Late', value: 'late' },
        { label: 'Leave', value: 'leave' },
        { label: 'Excused', value: 'excused' },
      ],
      admin: {
        description: 'Student attendance status',
      },
    },

    // ===== MARKED BY =====
    {
      name: 'markedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Marked By',
      filterOptions: {
        role: { equals: 'teacher' },
      },
      admin: {
        description: 'Teacher who marked attendance',
      },
    },

    // ===== REMARKS =====
    {
      name: 'remarks',
      type: 'textarea',
      label: 'Remarks',
      admin: {
        description: 'Optional notes about this attendance record',
      },
    },

    // ===== SEMESTER (Auto-filled from class) =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      label: 'Semester',
      admin: {
        readOnly: true,
        description: 'Auto-filled from class',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['student', 'class', 'date'],
      unique: true,
    },
    {
      fields: ['class', 'date'],
    },
    {
      fields: ['student', 'date'],
    },
    {
      fields: ['semester'],
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      async ({ data, req, context }) => {
        // Skip if this is a recursive call
        if (context.skipSemesterFill) return data

        // Auto-fill semester from class
        if (data?.class && !data?.semester) {
          try {
            const classDoc = await req.payload.findByID({
              collection: 'classes',
              id: data.class,
              depth: 0,
              req,
            })
            if (classDoc?.semester) {
              data.semester = classDoc.semester
            }
          } catch {
            // Keep existing semester if any
          }
        }
        return data
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Teachers can see attendance for their classes only
      if (user?.role === 'teacher') {
        return { class: { teacher: { equals: user.id } } }
      }
      // Students can see their own attendance
      if (user?.role === 'student') {
        return { student: { user: { equals: user.id } } }
      }
      // Admin and coordinator can see all
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    create: ({ req: { user } }) => {
      if (user?.role === 'teacher') {
        return { class: { teacher: { equals: user.id } } }
      }
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'teacher') {
        return { class: { teacher: { equals: user.id } } }
      }
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
  },
}
