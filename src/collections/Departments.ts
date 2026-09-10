import { CollectionConfig } from 'payload'

export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    group: 'University',
    description: 'Manage university departments',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Department Name',
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: 'Department Code',
      admin: {
        description: 'e.g., CS, MATH, PHY',
      },
    },
    {
      name: 'totalSemesters',
      type: 'select',
      required: false,
      defaultValue: '8',
      label: 'Total Semesters',
      options: [
        { label: '4 Semesters (2-year program)', value: '4' },
        { label: '8 Semesters (4-year program, BS)', value: '8' },
      ],
      admin: {
        description: 'Default program length for this department',
      },
    },
  ],
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
