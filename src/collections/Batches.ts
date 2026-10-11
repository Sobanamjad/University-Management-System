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
        description:
          'Which semester is currently active for this batch (auto-updates all students)',
        width: '50%',
      },
      validate: (value: number | null | undefined) => {
        if (value === null || value === undefined) return true
        if (value < 1 || value > 8) return 'Must be between 1 and 8'
        return true
      },
    },

    // ===== 5.5 CURRENT SEMESTER (Reference) =====
    {
      name: 'currentSemester',
      type: 'relationship',
      relationTo: 'semesters',
      label: 'Current Semester Reference',
      admin: {
        description: 'Link to the actual semester document (auto-updated)',
        readOnly: true,
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
      async ({ data, req, context }) => {
        // Skip if this is a recursive call
        if (context.skipBatchNameGeneration) return data

        const deptId = data?.department
        const startYear = data?.startYear
        const totalSemesters = data?.totalSemesters
        if (deptId && startYear) {
          try {
            const dept = await req.payload.findByID({
              collection: 'departments',
              id: String(deptId),
              depth: 0,
              req,
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
      async ({ doc, previousDoc, operation, req, context }) => {
        // Skip if this is a recursive call
        if (context.skipStudentProgression) return

        if (operation === 'create') {
          console.log(`✅ New batch created: ${doc.name}`)
        }

        // Student Progression: Update all students when semester advances
        if (
          operation === 'update' &&
          previousDoc?.currentSemesterNumber !== doc.currentSemesterNumber
        ) {
          const students = await req.payload.find({
            collection: 'students',
            where: { batch: { equals: doc.id } },
            depth: 0,
            req,
          })

          // Find the correct semester for this batch
          const semester = await req.payload.find({
            collection: 'semesters',
            where: {
              and: [
                { department: { equals: doc.department } },
                { semesterNumber: { equals: doc.currentSemesterNumber } },
              ],
            },
            depth: 0,
            req,
          })

          let updatedCount = 0
          for (const student of students.docs) {
            try {
              await req.payload.update({
                collection: 'students',
                id: student.id,
                data: {
                  semester: semester.docs[0]?.id || null,
                },
                context: { skipStudentProgression: true, skipStudentAutoFill: true },
                req,
              })
              updatedCount++
            } catch (err) {
              console.error(`Failed to update student ${student.id}:`, err)
            }
          }

          console.log(
            `✅ Advanced ${updatedCount} students to semester ${doc.currentSemesterNumber}`,
          )
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
