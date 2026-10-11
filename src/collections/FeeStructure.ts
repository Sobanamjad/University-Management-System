// collections/FeeStructure.ts
import { CollectionConfig } from 'payload'

export const FeeStructure: CollectionConfig = {
  slug: 'fee-structure',
  admin: {
    useAsTitle: 'title',
    group: 'Finance',
    defaultColumns: ['title', 'amount', 'semester', 'dueDate', 'status'],
    description: 'Define fee structures for different semesters',
  },
  fields: [
    // ===== TITLE =====
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Fee Title',
      admin: {
        description: 'e.g., Fall 2024 Semester Fee',
      },
    },

    // ===== SEMESTER =====
    {
      name: 'semester',
      type: 'relationship',
      relationTo: 'semesters',
      required: true,
      label: 'Semester',
      admin: {
        description: 'Which semester this fee applies to',
      },
    },

    // ===== BATCH (Optional - for batch-specific fees) =====
    {
      name: 'batch',
      type: 'relationship',
      relationTo: 'batches',
      label: 'Batch (Optional)',
      admin: {
        description: 'Leave empty to apply to all batches',
      },
    },

    // ===== FEE TYPE =====
    {
      name: 'feeType',
      type: 'select',
      required: true,
      label: 'Fee Type',
      options: [
        { label: 'Tuition Fee', value: 'tuition' },
        { label: 'Admission Fee', value: 'admission' },
        { label: 'Exam Fee', value: 'exam' },
        { label: 'Library Fee', value: 'library' },
        { label: 'Lab Fee', value: 'lab' },
        { label: 'Sports Fee', value: 'sports' },
        { label: 'Transport Fee', value: 'transport' },
        { label: 'Other', value: 'other' },
      ],
    },

    // ===== AMOUNT =====
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Amount (PKR)',
      min: 0,
      admin: {
        description: 'Fee amount in Pakistani Rupees',
      },
    },

    // ===== DUE DATE =====
    {
      name: 'dueDate',
      type: 'date',
      required: true,
      label: 'Due Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Last date to pay without late fee',
      },
    },

    // ===== LATE FEE POLICY =====
    {
      name: 'lateFeePolicy',
      type: 'group',
      label: 'Late Fee Policy',
      fields: [
        {
          name: 'hasLateFee',
          type: 'checkbox',
          label: 'Apply Late Fee',
          defaultValue: false,
        },
        {
          name: 'lateFeeAmount',
          type: 'number',
          label: 'Late Fee Amount (PKR)',
          min: 0,
          admin: {
            condition: (data) => data?.lateFeePolicy?.hasLateFee,
          },
        },
        {
          name: 'lateFeePerDay',
          type: 'checkbox',
          label: 'Per Day',
          defaultValue: false,
          admin: {
            condition: (data) => data?.lateFeePolicy?.hasLateFee,
            description: 'If checked, late fee applies per day after due date',
          },
        },
      ],
    },

    // ===== DESCRIPTION =====
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Additional details about this fee',
      },
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
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    { fields: ['semester'] },
    { fields: ['batch'] },
    { fields: ['feeType'] },
    { fields: ['status'] },
  ],

  // ===== ACCESS CONTROL =====
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'coordinator',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
