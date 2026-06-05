// collections/Students.ts
import { CollectionConfig } from 'payload'

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Academic',
    defaultColumns: ['displayTitle', 'department', 'semester', 'batch'],
    description: 'Manage student academic records',
  },
  fields: [
    // ===== DISPLAY TITLE (Auto: rollNo - Name) =====
    {
      name: 'displayTitle',
      type: 'text',
      label: 'Student',
      admin: {
        readOnly: true,
        description: 'Auto-generated: Roll No - Student Name',
      },
    },

    // ===== ACADEMIC INFO ONLY =====
    {
      name: 'rollNo',
      type: 'text',
      required: true,
      unique: true,
      label: 'Roll Number',
      admin: {
        placeholder: 'e.g., CS-2024-001',
      },
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
    },
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Current Semester',
      filterOptions: ({ data }) => {
        if (data?.department) {
          return {
            department: { equals: data.department },
          } as any
        }
        return true
      },
    },
    {
      name: 'batch',
      type: 'text',
      required: true,
      label: 'Batch',
      admin: {
        placeholder: 'e.g., 2024-2028',
      },
    },
    {
      name: 'admissionDate',
      type: 'date',
      required: true,
      label: 'Admission Date',
    },

    // ===== LINK TO USER =====
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      label: 'User Account',
      filterOptions: {
        role: { equals: 'student' },
      },
      admin: {
        description: 'Link to student account (personal info will come from Users)',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['rollNo'],
      unique: true,
    },
    {
      fields: ['user'],
      unique: true,
    },
    {
      fields: ['department'],
    },
    {
      fields: ['semester'],
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-generate rollNo if not set
        if (!data?.rollNo && data?.department && data?.batch) {
          const year = data.batch.split('-')[0] || new Date().getFullYear()
          const deptCode = data.department?.toString().slice(-3).toUpperCase() || 'XXX'
          const random = Math.floor(100 + Math.random() * 900)
          data.rollNo = `${deptCode}-${year}-${random}`
        }

        // Auto-generate displayTitle: "rollNo - Name"
        if (data?.user) {
          try {
            const userId = typeof data.user === 'object' ? (data.user as any).id : data.user
            const userDoc = await req.payload.findByID({
              collection: 'users',
              id: userId,
              depth: 0,
            })
            const rollNo = data.rollNo || 'N/A'
            const name = userDoc?.name || 'Unknown'
            data.displayTitle = `${rollNo} - ${name}`
          } catch {
            data.displayTitle = data.rollNo || 'Unknown'
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
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
