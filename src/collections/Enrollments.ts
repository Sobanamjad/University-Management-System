// collections/Enrollments.ts
import { CollectionConfig } from 'payload'

// Helper: safely extract numeric ID from relationship value
const toId = (val: unknown): number | undefined => {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return val
  if (typeof val === 'string' && !isNaN(Number(val)) && Number(val) > 0) return Number(val)
  if (val && typeof val === 'object' && 'value' in val) return toId((val as any).value)
  return undefined
}

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
    group: 'Academic',
    defaultColumns: ['student', 'class', 'status', 'createdAt'],
    description: 'Manage student enrollments in class sections',
  },
  fields: [
    // ===== 1. UNIVERSITY (filter only — not saved) =====
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

    // ===== 2. DEPARTMENT (filter only — not saved) =====
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

    // ===== 3. STUDENT (filtered by university + department) =====
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      label: 'Student',
      filterOptions: ({ data }) => {
        const uniId = toId(data?.university)
        const deptId = toId(data?.department)
        if (uniId && deptId) {
          return {
            university: { equals: uniId },
            department: { equals: deptId },
          }
        }
        if (uniId) {
          return { university: { equals: uniId } }
        }
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.university && data?.department),
        description: 'Students filtered by selected university & department',
      },
    },

    // ===== 4. CLASS (filtered by university + department) =====
    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      label: 'Class',
      filterOptions: ({ data }) => {
        const uniId = toId(data?.university)
        const deptId = toId(data?.department)
        if (uniId && deptId) {
          return {
            university: { equals: uniId },
            department: { equals: deptId },
          }
        }
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.university && data?.department),
        description: 'Classes filtered by selected university & department',
      },
    },

    // ===== 5. STATUS =====
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

  // ===== INDEXES =====
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

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Check class capacity on new enrollment
        if (operation === 'create' && data?.class && data?.status === 'enrolled') {
          const classId = typeof data.class === 'object' ? (data.class as any).id : data.class

          const classDoc = await req.payload.findByID({
            collection: 'classes',
            id: classId,
            depth: 0,
          })

          if (classDoc) {
            const existingCount = await req.payload.find({
              collection: 'enrollments',
              where: {
                class: { equals: classId },
                status: { equals: 'enrolled' },
              },
              limit: 0,
            })

            if (existingCount.totalDocs >= (classDoc.maxStudents || 0)) {
              throw new Error(`Class is full! Max capacity is ${classDoc.maxStudents} students.`)
            }
          }
        }

        return data
      },
    ],

    afterChange: [
      async ({ doc, req }) => {
        // Sync currentStudents count on the class after any enrollment change
        if (doc?.class) {
          const classId = typeof doc.class === 'object' ? (doc.class as any).id : doc.class

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
        }
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
