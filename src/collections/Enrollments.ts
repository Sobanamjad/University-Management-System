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
    group: 'Academic',
    defaultColumns: ['student', 'semester', 'class', 'status', 'createdAt'],
    description: 'Manage student enrollments in class sections',
  },
  fields: [
    {
      name: 'university',
      type: 'relationship',
      relationTo: 'universities',
      required: true,
      label: 'University',
      admin: {
        description: 'Select university first to filter students and classes',
      },
    },

    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
      admin: {
        condition: (data) => Boolean(data?.university),
        description: 'Select department to filter students and classes',
      },
    },

    // ===== SEMESTER (NEW) =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Semester',
      filterOptions: ({ data }) => {
        const deptId = toId(data?.department)
        const uniId = toId(data?.university)

        if (deptId && uniId) {
          return {
            and: [{ department: { equals: deptId } }, { university: { equals: uniId } }],
          } as any
        }
        if (deptId) {
          return { department: { equals: deptId } } as any
        }
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department),
      },
    },

    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      label: 'Student',
      filterOptions: ({ data }) => {
        const uniId = toId(data?.university)
        const deptId = toId(data?.department)
        const semId = toId(data?.semester)

        const where: any = { and: [] }
        if (uniId) where.and.push({ university: { equals: uniId } })
        if (deptId) where.and.push({ department: { equals: deptId } })
        if (semId) where.and.push({ semester: { equals: semId } })

        return where.and.length > 0 ? (where as any) : true
      },
      admin: {
        condition: (data) => Boolean(data?.university && data?.department && data?.semester),
        description: 'Students filtered by university, department & semester',
      },
    },

    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      label: 'Class',
      filterOptions: ({ data }) => {
        const uniId = toId(data?.university)
        const deptId = toId(data?.department)
        const semId = toId(data?.semester)

        const where: any = { and: [] }
        if (uniId) where.and.push({ university: { equals: uniId } })
        if (deptId) where.and.push({ department: { equals: deptId } })
        if (semId) where.and.push({ semester: { equals: semId } })

        return where.and.length > 0 ? (where as any) : true
      },
      admin: {
        condition: (data) => Boolean(data?.university && data?.department && data?.semester),
        description: 'Classes filtered by university, department & semester',
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
      async ({ data, req, operation }) => {
        // Check class capacity on new enrollment
        if (operation === 'create' && data?.class && data?.status === 'enrolled') {
          const classId = toId(data.class)

          if (classId) {
            const classDoc = await req.payload.findByID({
              collection: 'classes',
              id: classId,
              depth: 0,
              req,
            })

            if (classDoc) {
              const existingCount = await req.payload.find({
                collection: 'enrollments',
                where: {
                  class: { equals: classId },
                  status: { equals: 'enrolled' },
                },
                limit: 0,
                req,
              })

              if (existingCount.totalDocs >= (classDoc.maxStudents || 0)) {
                throw new Error(`Class is full! Max capacity is ${classDoc.maxStudents} students.`)
              }
            }
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
          const enrolled = await req.payload.find({
            collection: 'enrollments',
            where: {
              class: { equals: classId },
              status: { equals: 'enrolled' },
            },
            limit: 0,
            req,
          })

          await req.payload.update({
            collection: 'classes',
            id: classId,
            data: { currentStudents: enrolled.totalDocs },
            req,
          })
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
