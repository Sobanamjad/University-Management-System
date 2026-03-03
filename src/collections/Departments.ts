import { CollectionConfig } from 'payload'

export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    group: 'Academic',
    description: 'Manage university departments',
  },

  // ===== HOOKS: Compute fullTitle BEFORE saving =====
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const deptName = data?.name ?? ''
        let uniName = ''

        const universityId =
          typeof data?.university === 'object' && data.university !== null
            ? (data.university as { id?: string }).id
            : data?.university

        if (universityId && req?.payload) {
          try {
            const uni = await req.payload.findByID({
              collection: 'universities',
              id: String(universityId),
              depth: 0,
            })
            uniName = (uni as { name?: string })?.name ?? ''
          } catch {}
        }

        return {
          ...data,
          fullTitle: uniName ? `${deptName} — ${uniName}` : deptName,
        }
      },
    ],
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
    // {
    //   name: 'university',
    //   type: 'relationship',
    //   relationTo: 'universities',
    //   required: true,
    //   label: 'Affiliated University',
    // },

    // // ===== STORED: fullTitle (computed & saved in beforeChange) =====
    // {
    //   name: 'fullTitle',
    //   type: 'text',
    //   label: 'Full Title',
    //   admin: {
    //     hidden: true,
    //     disableBulkEdit: true,
    //     readOnly: true,
    //   },
    // },
  ],
}
