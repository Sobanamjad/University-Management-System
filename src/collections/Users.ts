import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    group: 'System',
  },
  fields: [
    // ========== BASIC FIELDS (Sabke liye) ==========
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email',
      validate: (value: string | null | undefined) => {
        if (!value) return true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address'
        }
        return true
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Coordinator', value: 'coordinator' },
        { label: 'Teacher', value: 'teacher' },
        { label: 'Student', value: 'student' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },

    // ========== TEACHER FIELDS (Sirf teacher ke liye) ==========
    {
      name: 'teacherInfo',
      type: 'group',
      label: 'Teacher Information',
      admin: {
        condition: (data) => {
          return data?.role === 'teacher'
        },
      },
      fields: [
        {
          name: 'department',
          type: 'relationship',
          relationTo: 'departments',
          label: 'Department',
          required: true,
          admin: {
            allowCreate: false,
          },
        },

        // Designation
        {
          name: 'designation',
          type: 'select',
          label: 'Designation',
          required: true,
          options: [
            { label: 'Permanent', value: 'Permanent' },
            { label: 'Visiting', value: 'visiting' },
          ],
        },

        // Qualification
        {
          name: 'qualification',
          type: 'text',
          label: 'Qualification',
          required: true,
          admin: {
            description: 'e.g., PhD Computer Science, M.Sc Mathematics',
          },
        },

        // Joining Date
        {
          name: 'joiningDate',
          type: 'date',
          label: 'Joining Date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
          required: true,
        },
      ],
    },

    // ========== COORDINATOR FIELDS (Sirf coordinator ke liye) ==========
    {
      name: 'coordinatorInfo',
      type: 'group',
      label: 'Coordinator Information',
      admin: {
        condition: (data) => {
          return data?.role === 'coordinator'
        },
      },
      fields: [
        {
          name: 'departments',
          type: 'relationship',
          relationTo: 'departments',
          label: 'Departments',
          required: true,
          hasMany: true,
          admin: {
            allowCreate: false,
          },
        },

        {
          name: 'qualification',
          type: 'text',
          label: 'Qualification',
          required: true,
          admin: {
            description: 'e.g., PhD Computer Science, M.Sc Mathematics',
          },
        },

        {
          name: 'joiningDate',
          type: 'date',
          label: 'Joining Date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
          required: true,
        },
      ],
    },

    // ========== PERSONAL INFO ==========
    {
      name: 'personalInfo',
      type: 'group',
      label: 'Personal Information',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Personal Phone',
          required: true,
        },
        {
          name: 'dateOfBirth',
          type: 'date',
          label: 'Date of Birth',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
          required: true,
        },
        {
          name: 'gender',
          type: 'select',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
          label: 'Gender',
          required: true,
        },
        {
          name: 'cnic',
          type: 'text',
          label: 'CNIC',
          validate: (value: string | string[] | null | undefined) => {
            if (!value || Array.isArray(value)) return true

            const numbersOnly = value.replace(/-/g, '')

            if (!/^\d+$/.test(numbersOnly)) {
              return 'CNIC should contain numbers only.'
            }

            if (numbersOnly.length !== 13) {
              return 'CNIC should be 13 digits long.'
            }

            return true
          },
          admin: {
            placeholder: '36300-5419772-3',
            description: '13 digits (format: 36300-5419772-3)',
            style: {
              fontFamily: 'monospace',
            },
          },
          required: true,
          hooks: {
            beforeValidate: [
              ({ value }) => {
                if (!value) return value

                const cleaned = value.replace(/-/g, '')

                if (cleaned.length === 13) {
                  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`
                }

                return value
              },
            ],
          },
        },
      ],
    },

    // ========== ADDRESS ==========
    {
      name: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        {
          name: 'street',
          type: 'text',
          label: 'Street Address',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          label: 'City',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          label: 'State',
          required: true,
        },
      ],
    },
  ],
}
