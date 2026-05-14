// collections/TeacherSalary.ts
import { CollectionConfig } from 'payload'

export const TeacherSalary: CollectionConfig = {
  slug: 'teacher-salary',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Payroll',
    defaultColumns: [
      'teacher',
      'teacherType',
      'fixedSalary',
      'perClassRate',
      'effectiveFrom',
      'status',
    ],
  },

  fields: [
    {
      name: 'displayTitle',
      type: 'text',
      admin: { readOnly: true },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            const teacherId = typeof data?.teacher === 'object' ? data.teacher?.id : data?.teacher
            if (teacherId) {
              try {
                const teacher = await req.payload.findByID({
                  collection: 'users',
                  id: teacherId,
                  depth: 0,
                })
                return `${teacher?.name || 'Unknown'} - ${data.teacherType || 'Unknown'}`
              } catch (err) {
                return `Teacher #${teacherId} - ${data.teacherType || 'Unknown'}`
              }
            }
            return data?.displayTitle
          },
        ],
      },
    },

    {
      name: 'teacher',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Teacher',
      filterOptions: { role: { equals: 'teacher' } },
    },

    // ===== TEACHER CATEGORY =====
    {
      name: 'teacherType',
      type: 'select',
      required: true,
      label: 'Teacher Type',
      options: [
        { label: 'Permanent', value: 'permanent' },
        { label: 'Visiting', value: 'visiting' },
      ],
      admin: {
        description: 'Select teacher category',
      },
    },

    // ===== PERMANENT TEACHER FIELDS =====
    {
      name: 'fixedSalary',
      type: 'number',
      label: 'Fixed Monthly Salary (PKR)',
      admin: {
        condition: (data) => data?.teacherType === 'permanent',
        placeholder: 'e.g., 80000',
        description: 'Monthly fixed salary for permanent teacher',
      },
    },

    // ===== VISITING TEACHER FIELDS =====
    {
      name: 'perClassRate',
      type: 'number',
      label: 'Per Class Rate (PKR)',
      admin: {
        condition: (data) => data?.teacherType === 'visiting',
        placeholder: 'e.g., 900',
        description: 'Rate per lecture/class',
      },
    },

    // ===== BONUS (Optional for both) =====
    {
      name: 'bonus',
      type: 'number',
      label: 'Monthly Bonus (Optional)',
      defaultValue: 0,
      admin: {
        placeholder: 'e.g., 5000',
        description: 'Extra bonus for this month',
      },
    },

    // ===== DEDUCTIONS (Only for Permanent) =====
    {
      name: 'deductions',
      type: 'group',
      label: 'Monthly Deductions',
      admin: {
        condition: (data) => data?.teacherType === 'permanent',
        description: 'Fixed deductions for permanent teachers',
      },
      fields: [
        {
          name: 'tax',
          type: 'number',
          label: 'Tax Deduction',
          defaultValue: 0,
        },
        {
          name: 'otherDeduction',
          type: 'number',
          label: 'Other Deduction',
          defaultValue: 0,
        },
      ],
    },

    // ===== EFFECTIVE DATE =====
    {
      name: 'effectiveFrom',
      type: 'date',
      required: true,
      label: 'Salary Effective From',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    {
      fields: ['teacher'],
      unique: true,
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.teacherType === 'permanent') {
          if (!data?.fixedSalary || data.fixedSalary <= 0) {
            throw new Error('Permanent teacher must have a fixed salary amount')
          }
        }

        if (data?.teacherType === 'visiting') {
          if (!data?.perClassRate || data.perClassRate <= 0) {
            throw new Error('Visiting teacher must have per class rate')
          }
        }

        return data
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
