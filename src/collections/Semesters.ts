// collections/Semesters.ts
import { CollectionConfig } from 'payload'

export const Semesters: CollectionConfig = {
  slug: 'semesters',
  admin: {
    useAsTitle: 'name',
    group: 'Academic',
    defaultColumns: [
      'session',
      'name',
      'semesterNumber',
      'department',
      'startDate',
      'endDate',
      'isActive',
      'status',
    ],
    description: 'Manage academic semesters for each department',
  },
  fields: [
    // ===== 1. SESSION =====
    {
      name: 'session',
      type: 'text',
      required: true,
      label: 'Session',
      admin: {
        placeholder: 'e.g., Fall 2024, Spring 2024',
        description: 'Enter academic session (e.g., Fall 2024)',
        width: '50%',
      },
    },

    // ===== 2. SEMESTER NUMBER =====
    {
      name: 'semesterNumber',
      type: 'select',
      required: true,
      label: 'Semester Number',
      options: [
        { label: '1st Semester', value: '1' },
        { label: '2nd Semester', value: '2' },
        { label: '3rd Semester', value: '3' },
        { label: '4th Semester', value: '4' },
        { label: '5th Semester', value: '5' },
        { label: '6th Semester', value: '6' },
        { label: '7th Semester', value: '7' },
        { label: '8th Semester', value: '8' },
      ],
      admin: {
        width: '50%',
      },
    },
    // ===== 3. SEMESTER NAME (Auto-generated) =====
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Semester Name',
      admin: {
        readOnly: true,
        description: 'Auto-generated from session, semester number, and department',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            if (data?.session && data?.semesterNumber && data?.department) {
              const semesterText = getSemesterText(data.semesterNumber)

              try {
                const dept = await req.payload.findByID({
                  collection: 'departments',
                  id: String(data.department),
                  depth: 0,
                })
                const deptCode = dept?.code || 'DEP'

                return `${data.session} - ${semesterText} - ${deptCode}`
              } catch (error) {
                return `${data.session} - ${semesterText}`
              }
            }
            return data?.name
          },
        ],
      },
    },

    // ===== 4. SEMESTER CODE (Auto-generated unique) =====
    {
      name: 'code',
      type: 'text',
      unique: true,
      label: 'Semester Code',
      admin: {
        readOnly: true,
        description: 'Auto-generated unique code including department',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            if (data?.session && data?.semesterNumber && data?.department) {
              const sessionCode = data.session.replace(/\s+/g, '').toUpperCase()
              const semesterSuffix = getSemesterSuffix(data.semesterNumber)

              try {
                const dept = await req.payload.findByID({
                  collection: 'departments',
                  id: String(data.department),
                  depth: 0,
                })
                const deptCode = dept?.code?.toUpperCase() || 'DEP'

                return `${sessionCode}-${semesterSuffix}-${deptCode}`
              } catch (error) {
                return `${sessionCode}-${semesterSuffix}`
              }
            }
            return data?.code
          },
        ],
      },
    },

    // ===== 5. DEPARTMENT (Now university-independent) =====
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
      admin: {
        description: 'Select the department (subject) for this semester',
      },
    },

    // ===== 6. DATES =====
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Start Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        width: '50%',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      label: 'End Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        width: '50%',
      },
    },

    // ===== 7. STATUS (Auto-calculated) =====
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Status',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        readOnly: true,
        description: 'Auto-calculated based on dates',
        position: 'sidebar',
      },
    },

    // ===== 8. ACTIVE SEMESTER =====
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      label: 'Active Semester',
      admin: {
        description: 'Check if this is the currently running semester for this department',
        position: 'sidebar',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['session', 'semesterNumber', 'department'],
      unique: true,
    },
    {
      fields: ['code'],
      unique: true,
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeValidate: [
      // Auto-calculate status based on dates
      ({ data }) => {
        if (data?.startDate && data?.endDate) {
          const now = new Date()
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)

          if (now < start) {
            data.status = 'upcoming'
          } else if (now > end) {
            data.status = 'completed'
          } else {
            data.status = 'ongoing'
          }
        }
        return data
      },

      // Validate dates
      ({ data }) => {
        if (data?.startDate && data?.endDate) {
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)

          if (end <= start) {
            throw new Error('End date must be after start date')
          }
        }
        return data
      },
    ],

    beforeChange: [
      // Ensure only one active semester per department
      async ({ data, req, originalDoc }) => {
        if (data.isActive) {
          const existingActive = await req.payload.find({
            collection: 'semesters',
            where: {
              department: { equals: data.department },
              isActive: { equals: true },
              id: { not_equals: originalDoc?.id || '0' },
            },
          })

          if (existingActive.docs.length > 0) {
            throw new Error(
              `This department already has an active semester: ${existingActive.docs[0].name}. ` +
                `Please deactivate that semester first.`,
            )
          }
        }
        return data
      },
    ],

    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`✅ New semester created: ${doc.name} (${doc.code})`)
        }
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
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
}

// ===== HELPER FUNCTIONS =====
function getSemesterSuffix(semesterNumber: string): string {
  const suffixes: Record<string, string> = {
    '1': '1ST',
    '2': '2ND',
    '3': '3RD',
    '4': '4TH',
    '5': '5TH',
    '6': '6TH',
    '7': '7TH',
    '8': '8TH',
  }
  return suffixes[semesterNumber] || `${semesterNumber}TH`
}

function getSemesterText(semesterNumber: string): string {
  const texts: Record<string, string> = {
    '1': '1st Semester',
    '2': '2nd Semester',
    '3': '3rd Semester',
    '4': '4th Semester',
    '5': '5th Semester',
    '6': '6th Semester',
    '7': '7th Semester',
    '8': '8th Semester',
  }
  return texts[semesterNumber] || `${semesterNumber}th Semester`
}
