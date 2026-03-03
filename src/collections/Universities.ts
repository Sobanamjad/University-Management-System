import { CollectionConfig } from 'payload'

export const Universities: CollectionConfig = {
  slug: 'universities',
  admin: {
    useAsTitle: 'name',
    group: 'System',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'University Name',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      required: true,
    },
  ],
}
