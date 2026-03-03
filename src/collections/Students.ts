// collections/Students.ts
import { CollectionConfig } from 'payload'

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'rollNo',
    group: 'Academic',
    defaultColumns: ['rollNo', 'user', 'department', 'semester', 'status'],
    description: 'Manage student academic records',
  },
  fields: [
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
      name: 'university',
      type: 'relationship',
      relationTo: 'universities',
      required: true,
      label: 'University',
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      label: 'Department',
      admin: {
        condition: (data) => Boolean(data?.university),
      },
    },
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Current Semester',
      filterOptions: ({ data }) => {
        if (data?.department && data?.university) {
          return {
            department: { equals: data.department },
            university: { equals: data.university },
          }
        }
        return false
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
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data?.rollNo && data?.department && data?.batch) {
          const year = data.batch.split('-')[0] || new Date().getFullYear()
          const deptCode = data.department?.toString().slice(-3).toUpperCase() || 'XXX'
          const random = Math.floor(100 + Math.random() * 900)
          data.rollNo = `${deptCode}-${year}-${random}`
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
