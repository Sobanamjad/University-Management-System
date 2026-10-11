// collections/FeePayments.ts
import { CollectionConfig } from 'payload'

export const FeePayments: CollectionConfig = {
  slug: 'fee-payments',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Finance',
    defaultColumns: ['displayTitle', 'student', 'amount', 'paidDate', 'status'],
    description: 'Track student fee payments',
  },
  fields: [
    // ===== DISPLAY TITLE (Auto-generated) =====
    {
      name: 'displayTitle',
      type: 'text',
      label: 'Payment Record',
      admin: {
        readOnly: true,
        description: 'Auto-generated: Student - Fee Type - Amount',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req, context }) => {
            if (context.skipDisplayTitle) return data?.displayTitle || ''

            if (data?.student && data?.feeStructure) {
              try {
                const student = await req.payload.findByID({
                  collection: 'students',
                  id: data.student,
                  depth: 0,
                  req,
                })
                const feeStructure = await req.payload.findByID({
                  collection: 'fee-structure',
                  id: data.feeStructure,
                  depth: 0,
                  req,
                })
                return `${student?.displayTitle || 'Student'} - ${feeStructure?.feeType || 'Fee'} - ${data.amount || 0}`
              } catch {
                return `${data.student} - ${data.feeStructure} - ${data.amount || 0}`
              }
            }
            return data?.displayTitle || ''
          },
        ],
      },
    },

    // ===== STUDENT =====
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      label: 'Student',
      admin: {
        description: 'Student making the payment',
      },
    },

    // ===== FEE STRUCTURE =====
    {
      name: 'feeStructure',
      type: 'relationship',
      relationTo: 'fee-structure',
      required: true,
      label: 'Fee Structure',
      admin: {
        description: 'The fee structure this payment is for',
      },
    },

    // ===== AMOUNT PAID =====
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Amount Paid (PKR)',
      min: 0,
      admin: {
        description: 'Actual amount paid by student',
      },
    },

    // ===== PAYMENT DATE =====
    {
      name: 'paidDate',
      type: 'date',
      required: true,
      label: 'Payment Date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },

    // ===== PAYMENT METHOD =====
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      label: 'Payment Method',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cheque', value: 'cheque' },
        { label: 'Online Payment', value: 'online' },
        { label: 'Credit Card', value: 'credit_card' },
      ],
    },

    // ===== TRANSACTION REFERENCE =====
    {
      name: 'transactionReference',
      type: 'text',
      label: 'Transaction Reference',
      admin: {
        description: 'Bank reference number or receipt number',
      },
    },

    // ===== RECEIPT NUMBER =====
    {
      name: 'receiptNumber',
      type: 'text',
      label: 'Receipt Number',
      unique: true,
      admin: {
        description: 'Auto-generated receipt number',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (!data?.receiptNumber) {
              const date = new Date()
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')
              return `REC-${year}${month}-${random}`
            }
            return data.receiptNumber
          },
        ],
      },
    },

    // ===== LATE FEE APPLIED =====
    {
      name: 'lateFeeApplied',
      type: 'number',
      label: 'Late Fee Applied (PKR)',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Late fee amount if payment was made after due date',
      },
    },

    // ===== STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Payment Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ===== REMARKS =====
    {
      name: 'remarks',
      type: 'textarea',
      label: 'Remarks',
      admin: {
        description: 'Additional notes about this payment',
      },
    },

    // ===== RECEIVED BY =====
    {
      name: 'receivedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Received By',
      filterOptions: {
        role: { in: ['admin', 'accountant'] },
      },
      admin: {
        description: 'Admin or accountant who received this payment',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    { fields: ['student'] },
    { fields: ['feeStructure'] },
    { fields: ['receiptNumber'], unique: true },
    { fields: ['status'] },
    { fields: ['paidDate'] },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      async ({ data, req, context }) => {
        // Skip if this is a recursive call
        if (context.skipFeePaymentAutoFill) return data

        // Auto-calculate late fee if payment is after due date
        if (data?.feeStructure && data?.paidDate) {
          try {
            const feeStructure = await req.payload.findByID({
              collection: 'fee-structure',
              id: data.feeStructure,
              depth: 0,
              req,
            })

            if (feeStructure?.dueDate && feeStructure?.lateFeePolicy?.hasLateFee) {
              const dueDate = new Date(feeStructure.dueDate)
              const paidDate = new Date(data.paidDate)

              if (paidDate > dueDate) {
                // Calculate late fee based on per-day or flat rate
                if (feeStructure.lateFeePolicy.lateFeePerDay) {
                  const daysLate = Math.ceil(
                    (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
                  )
                  data.lateFeeApplied = (feeStructure.lateFeePolicy.lateFeeAmount || 0) * daysLate
                } else {
                  data.lateFeeApplied = feeStructure.lateFeePolicy.lateFeeAmount || 0
                }
              } else {
                data.lateFeeApplied = 0
              }
            }
          } catch {
            // Keep existing late fee
          }
        }

        return data
      },
    ],
  },

  // ===== ACCESS CONTROL =====
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Students can see their own payments
      if (user?.role === 'student') {
        return { student: { user: { equals: user.id } } } as any
      }
      // Admin, coordinator, and accountant can see all
      return user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'accountant'
    },
    create: ({ req: { user } }) =>
      user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'accountant',
    update: ({ req: { user } }) =>
      user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'accountant',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
