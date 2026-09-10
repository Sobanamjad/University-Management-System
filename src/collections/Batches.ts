// collections/Batches.ts
import { CollectionConfig } from 'payload'

export const Batches: CollectionConfig = {
  slug: 'batches',
  admin: {
    useAsTitle: 'name',
    group: 'University',
    defaultColumns: ['name', 'department', 'startYear', 'currentSemesterNumber', 'status'],
    description:
      'Manage student batches — one batch = one group of students per department per year',
  },
  fields: [
    // ===== 1. BATCH NAME (Auto-generated) =====
    {
      name: 'name',
      type: 'text',
      label: 'Batch Name',
      admin: {
        readOnly: true,
        description: 'Auto-generated: e.g., BS CS 2024',
      },
    },

    // ===== 2. DEPARTMENT =====
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
      admin: {
        description: 'Department this batch belongs to',
      },
    },

    // ===== 3. START YEAR =====
    {
      name: 'startYear',
      type: 'number',
      required: true,
      label: 'Start Year',
      admin: {
        placeholder: 'e.g., 2024',
        description: 'Year the batch started (e.g., 2024)',
        width: '50%',
      },
      validate: (value: number | null | undefined) => {
        if (!value) return true
        const year = Number(value)
        if (year < 2000 || year > 2100) return 'Please enter a valid year (2000–2100)'
        return true
      },
    },

    // ===== 4. TOTAL SEMESTERS =====
    {
      name: 'totalSemesters',
      type: 'select',
      required: true,
      label: 'Total Semesters',
      defaultValue: '8',
      options: [
        { label: '4 Semesters — ADS (2-year program)', value: '4' },
        { label: '8 Semesters — BS (4-year program)', value: '8' },
      ],
      admin: {
        description: 'Total number of semesters in this program',
        width: '50%',
      },
    },

    // ===== 5. CURRENT SEMESTER NUMBER =====
    {
      name: 'currentSemesterNumber',
      type: 'number',
      defaultValue: 1,
      label: 'Current Semester Number',
      admin: {
        description: 'Which semester is currently active for this batch (auto-updated on advance)',
        width: '50%',
      },
      validate: (value: number | null | undefined) => {
        if (value === null || value === undefined) return true
        if (value < 1 || value > 8) return 'Must be between 1 and 8'
        return true
      },
    },

    // ===== 6. STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      label: 'Batch Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Active = currently running, Completed = all semesters done',
      },
    },

    // ===== 7. SESSION =====
    {
      name: 'session',
      type: 'text',
      label: 'Academic Session',
      admin: {
        placeholder: 'e.g., 2024-2028',
        description: 'Full academic session range',
        width: '50%',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['department', 'startYear'],
      unique: true,
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      // Auto-generate batch name: e.g. "BS Mathematics 2024" or "ADS Mathematics 2024"
      async ({ data, req }) => {
        const deptId = data?.department
        const startYear = data?.startYear
        const totalSemesters = data?.totalSemesters
        if (deptId && startYear) {
          try {
            const dept = await req.payload.findByID({
              collection: 'departments',
              id: String(deptId),
              depth: 0,
              overrideAccess: true,
            })
            const prefix = totalSemesters === '4' ? 'ADS' : 'BS'
            data.name = `${prefix} ${dept?.name || 'Dept'} ${startYear}`
          } catch {
            data.name = `Batch ${startYear}`
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`✅ New batch created: ${doc.name}`)
        }
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: () => true,
    create: ({ req: { user } }) =>
      Boolean(user) && (user?.role === 'admin' || user?.role === 'coordinator'),
    update: ({ req: { user } }) =>
      Boolean(user) && (user?.role === 'admin' || user?.role === 'coordinator'),
    delete: ({ req: { user } }) => Boolean(user) && user?.role === 'admin',
  },
}
