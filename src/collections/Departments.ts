import { CollectionConfig } from 'payload'

export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    group: 'Academic',
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
