// collections/Enrollments.ts
import { CollectionConfig } from 'payload'

// Helper: safely extract numeric ID from relationship value (standardized for this project)
const toId = (val: unknown): number | undefined => {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return val
  if (typeof val === 'string' && !isNaN(Number(val)) && Number(val) > 0) return Number(val)
  if (val && typeof val === 'object') {
    if ('id' in val) return toId((val as any).id)
    if ('value' in val) return toId((val as any).value)
  }
  return undefined
}

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
    group: 'University',
    defaultColumns: ['student', 'semester', 'class', 'status', 'grade', 'gpa', 'createdAt'],
    description: 'Manage student enrollments in class sections',
  },
  fields: [
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
      admin: {
        description: 'Select department to filter students and classes',
      },
    },

    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      label: 'Student',
      filterOptions: ({ data }) => {
        const deptId = toId(data?.department)
        if (deptId) return { department: { equals: deptId } } as any
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department),
        description: 'Students filtered by department',
      },
    },

    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      label: 'Class',
      filterOptions: ({ data }) => {
        const deptId = toId(data?.department)
        if (deptId) return { department: { equals: deptId } } as any
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department),
        description: 'Classes filtered by department',
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

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'enrolled',
      label: 'Status',
      options: [
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Dropped', value: 'dropped' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ===== GRADE =====
    {
      name: 'grade',
      type: 'select',
      label: 'Grade',
      options: [
        { label: 'A+ (4.0)', value: 'A+' },
        { label: 'A (3.7)', value: 'A' },
        { label: 'A- (3.3)', value: 'A-' },
        { label: 'B+ (3.0)', value: 'B+' },
        { label: 'B (2.7)', value: 'B' },
        { label: 'B- (2.3)', value: 'B-' },
        { label: 'C+ (2.0)', value: 'C+' },
        { label: 'C (1.7)', value: 'C' },
        { label: 'C- (1.3)', value: 'C-' },
        { label: 'D+ (1.0)', value: 'D+' },
        { label: 'D (0.7)', value: 'D' },
        { label: 'F (0.0)', value: 'F' },
      ],
      admin: {
        description: 'Final grade for this course',
      },
    },

    // ===== GPA (Auto-calculated) =====
    {
      name: 'gpa',
      type: 'number',
      label: 'GPA Points',
      admin: {
        readOnly: true,
        description: 'Auto-calculated from grade',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const gradeToPoints: Record<string, number> = {
              'A+': 4.0,
              A: 3.7,
              'A-': 3.3,
              'B+': 3.0,
              B: 2.7,
              'B-': 2.3,
              'C+': 2.0,
              C: 1.7,
              'C-': 1.3,
              'D+': 1.0,
              D: 0.7,
              F: 0.0,
            }
            if (data?.grade) {
              data.gpa = gradeToPoints[data.grade] || 0
            }
            return data
          },
        ],
      },
    },
  ],

  indexes: [
    {
      fields: ['student', 'class'],
      unique: true,
    },
    {
      fields: ['student'],
    },
    {
      fields: ['class'],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, context }) => {
        // Skip if this is a seed-time bypass
        if (context.skipSemesterFill || context.skipAllHooks) return data

        // Auto-fill semester from class
        if (data?.class && !data?.semester) {
          try {
            const classId = toId(data.class)
            if (classId) {
              // Note: no req — runs as admin to avoid deepmerge circular ref crash
              const classDoc = await req.payload.findByID({
                collection: 'classes',
                id: classId,
                depth: 0,
              })
              if (classDoc?.semester) {
                data.semester = toId(classDoc.semester)
              }
            }
          } catch {
            // Keep existing semester if any
          }
        }

        return data
      },
    ],

    afterChange: [
      async ({ doc, req }) => {
        // Sync currentStudents count on the class after any enrollment change
        const classId = toId(doc?.class)
        if (classId) {
          try {
            const enrolled = await req.payload.find({
              collection: 'enrollments',
              where: {
                class: { equals: classId },
                status: { equals: 'enrolled' },
              },
              limit: 0,
            })

            await req.payload.update({
              collection: 'classes',
              id: classId,
              data: { currentStudents: enrolled.totalDocs },
            })
          } catch {
            // Non-critical
          }
        }
      },
    ],

  },

  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
