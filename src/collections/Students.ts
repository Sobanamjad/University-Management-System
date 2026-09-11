// collections/Students.ts
import { CollectionConfig } from 'payload'

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'University',
    defaultColumns: ['displayTitle', 'rollNo', 'batch', 'department', 'semester', 'status'],
    description: 'Manage student University records',
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

    // ===== ROLL NUMBER =====
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

    // ===== BATCH (relationship) =====
    {
      name: 'batch',
      type: 'relationship',
      relationTo: 'batches',
      required: false,
      label: 'Batch',
      admin: {
        description: 'Link student to a batch for semester progression tracking',
      },
    },

    // ===== DEPARTMENT (auto-filled from batch) =====
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: false,
      label: 'Department',
      admin: {
        description: 'Auto-filled from batch',
        readOnly: true,
      },
    },

    // ===== CURRENT SEMESTER (filtered by batch) =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: false,
      label: 'Current Semester',
      filterOptions: ({ data }) => {
        const batchId = typeof data?.batch === 'object' ? (data.batch as any)?.id : data?.batch
        if (batchId) {
          return { batch: { equals: batchId } } as any
        }
        return true
      },
      admin: {
        description: 'Filtered by batch',
      },
    },

    // ===== ADMISSION DATE =====
    {
      name: 'admissionDate',
      type: 'date',
      required: true,
      label: 'Admission Date',
    },

    // ===== STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Graduated', value: 'graduated' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        position: 'sidebar',
      },
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
        description: 'Link to student user account',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    { fields: ['rollNo'], unique: true },
    { fields: ['user'], unique: true },
    { fields: ['department'] },
    { fields: ['semester'] },
    { fields: ['batch'] },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-fill department from batch
        if (data?.batch) {
          try {
            const batch = await req.payload.findByID({
              collection: 'batches',
              id: String(data.batch),
              depth: 1,
              overrideAccess: true,
              req,
            })
            if (batch?.department) {
              data.department =
                typeof batch.department === 'object'
                  ? (batch.department as any).id
                  : batch.department
            }
          } catch {
            // keep existing department
          }
        }

        // Auto-generate displayTitle: "CS-2024-001 - Ali Hassan"
        if (data?.user) {
          try {
            const userId = typeof data.user === 'object' ? (data.user as any).id : data.user
            const userDoc = await req.payload.findByID({
              collection: 'users',
              id: String(userId),
              depth: 0,
              overrideAccess: true,
              req,
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
