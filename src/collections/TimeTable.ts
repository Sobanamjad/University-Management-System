// collections/TimeTable.ts
import { CollectionConfig } from 'payload'

const toId = (val: unknown): number | undefined => {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return val
  if (typeof val === 'string' && !isNaN(Number(val)) && Number(val) > 0) return Number(val)
  if (val && typeof val === 'object') {
    if ('id' in val) return toId((val as any).id)
    if ('value' in val) return toId((val as any).value)
  }
  return undefined
}

export const TimeTable: CollectionConfig = {
  slug: 'timetable',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Academic',
    defaultColumns: ['displayTitle', 'class', 'teacher', 'day', 'timeSlot', 'subject', 'room'],
    description: 'Complete timetable - View by class OR by teacher',
  },

  fields: [
    // ===== DISPLAY TITLE (Auto-generated) =====
    {
      name: 'displayTitle',
      type: 'text',
      label: 'Schedule Entry',
      admin: {
        readOnly: true,
        description: 'Auto-generated: Class - Subject - Teacher',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            if (data?.class && data?.subject && data?.teacher) {
              const classId = toId(data.class)
              const subjectId = toId(data.subject)
              const teacherId = toId(data.teacher)

              try {
                const classDoc = await req.payload.findByID({
                  collection: 'classes',
                  id: classId,
                  depth: 0,
                })
                const subjectDoc = await req.payload.findByID({
                  collection: 'courses',
                  id: subjectId,
                  depth: 0,
                })
                const teacherDoc = await req.payload.findByID({
                  collection: 'users',
                  id: teacherId,
                  depth: 0,
                })

                const className = classDoc?.title || 'Unknown Class'
                const subjectName = subjectDoc?.title || 'Unknown Subject'
                const teacherName = teacherDoc?.name || 'Unknown Teacher'

                return `${className} - ${subjectName} - ${teacherName}`
              } catch {
                return `${data.class} - ${data.subject} - ${data.teacher}`
              }
            }
            return data?.displayTitle
          },
        ],
      },
    },

    // ===== 1. UNIVERSITY & DEPARTMENT (Context) =====
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
      label: 'Semester',
      filterOptions: ({ data }) => {
        const deptId = toId(data?.department)
        const uniId = toId(data?.university)
        if (deptId && uniId) {
          return {
            and: [{ department: { equals: deptId } }, { university: { equals: uniId } }],
          }
        }
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.department),
      },
    },

    // ===== 2. CLASS (Class Timetable ke liye) =====
    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      label: 'Class/Section',
      filterOptions: ({ data }) => {
        const uniId = toId(data?.university)
        const deptId = toId(data?.department)
        const semId = toId(data?.semester)

        const where: any = { and: [] }
        if (uniId) where.and.push({ university: { equals: uniId } })
        if (deptId) where.and.push({ department: { equals: deptId } })
        if (semId) where.and.push({ semester: { equals: semId } })

        return where.and.length > 0 ? where : true
      },
      admin: {
        description: 'Select class (e.g., CS101 Section A)',
      },
    },

    // ===== 3. TEACHER (Teacher Timetable ke liye) =====
    {
      name: 'teacher',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Teacher',
      filterOptions: ({ data }) => {
        const deptId = toId(data?.department)
        if (deptId) {
          return {
            role: { equals: 'teacher' },
            'teacherInfo.department': { equals: deptId },
          }
        }
        return { role: { equals: 'teacher' } }
      },
      admin: {
        description: 'Select teacher',
      },
    },

    // ===== 4. SUBJECT =====
    {
      name: 'subject',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Subject/Course',
      filterOptions: ({ data }) => {
        const deptId = toId(data?.department)
        const uniId = toId(data?.university)

        if (deptId && uniId) {
          return {
            and: [{ department: { equals: deptId } }, { university: { equals: uniId } }],
          }
        }
        return true
      },
    },

    // ===== 5. DAY & TIME =====
    {
      name: 'day',
      type: 'select',
      required: true,
      label: 'Day',
      options: [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
      ],
      admin: {
        width: '25%',
      },
    },

    {
      name: 'timeSlot',
      type: 'select',
      required: true,
      label: 'Time Slot',
      options: [
        { label: '08:00 - 09:00', value: '08:00-09:00' },
        { label: '09:00 - 10:00', value: '09:00-10:00' },
        { label: '10:00 - 11:00', value: '10:00-11:00' },
        { label: '11:00 - 12:00', value: '11:00-12:00' },
        { label: '12:00 - 13:00', value: '12:00-13:00' },
        { label: '13:00 - 14:00', value: '13:00-14:00' },
        { label: '14:00 - 15:00', value: '14:00-15:00' },
        { label: '15:00 - 16:00', value: '15:00-16:00' },
        { label: '16:00 - 17:00', value: '16:00-17:00' },
      ],
      admin: {
        width: '25%',
      },
    },

    // ===== 6. LOCATION =====
    {
      name: 'room',
      type: 'text',
      required: true,
      label: 'Room Number',
      admin: {
        placeholder: 'e.g., Room 101, Lab 3',
        width: '50%',
      },
    },

    // ===== 7. LECTURE DETAILS =====
    {
      name: 'lectureType',
      type: 'select',
      required: true,
      defaultValue: 'theory',
      label: 'Lecture Type',
      options: [
        { label: 'Theory', value: 'theory' },
        { label: 'Lab', value: 'lab' },
        { label: 'Tutorial', value: 'tutorial' },
      ],
      admin: {
        width: '50%',
      },
    },

    // ===== 8. STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Holiday', value: 'holiday' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],

  // ===== INDEXES (Prevent conflicts) =====
  indexes: [
    {
      fields: ['class', 'day', 'timeSlot', 'semester'],
      unique: true,
    },
    {
      fields: ['teacher', 'day', 'timeSlot', 'semester'],
      unique: true,
    },
    {
      fields: ['room', 'day', 'timeSlot', 'semester'],
      unique: true,
    },
    {
      fields: ['class', 'semester'],
    },
    {
      fields: ['teacher', 'semester'],
    },
    {
      fields: ['day', 'timeSlot'],
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeValidate: [
      // Auto-fill university, department, semester from class
      async ({ data, req }) => {
        if (data?.class && (!data?.university || !data?.department || !data?.semester)) {
          const classDoc = await req.payload.findByID({
            collection: 'classes',
            id: toId(data.class),
            depth: 0,
            req,
          })

          if (classDoc) {
            if (!data?.university) data.university = classDoc.university
            if (!data?.department) data.department = classDoc.department
            if (!data?.semester) data.semester = classDoc.semester
          }
        }
        return data
      },

      // Check teacher availability (no double booking)
      async ({ data, req, originalDoc }) => {
        if (data?.teacher && data?.day && data?.timeSlot && data?.semester) {
          const teacherId = toId(data.teacher)
          const semesterId = toId(data.semester)

          const existing = await req.payload.find({
            collection: 'timetable',
            where: {
              and: [
                { teacher: { equals: teacherId } },
                { day: { equals: data.day } },
                { timeSlot: { equals: data.timeSlot } },
                { semester: { equals: semesterId } },
                { id: { not_equals: originalDoc?.id || '0' } },
              ],
            },
            req,
          })

          if (existing.docs.length > 0) {
            throw new Error(
              `⚠️ Teacher is already assigned to another class on ${data.day} at ${data.timeSlot}!`,
            )
          }
        }
        return data
      },

      async ({ data, req, originalDoc }) => {
        if (data?.room && data?.day && data?.timeSlot && data?.semester) {
          const semesterId = toId(data.semester)

          const existing = await req.payload.find({
            collection: 'timetable',
            where: {
              and: [
                { room: { equals: data.room } },
                { day: { equals: data.day } },
                { timeSlot: { equals: data.timeSlot } },
                { semester: { equals: semesterId } },
                { id: { not_equals: originalDoc?.id || '0' } },
              ],
            },
            req,
          })

          if (existing.docs.length > 0) {
            throw new Error(
              `⚠️ Room ${data.room} is already booked on ${data.day} at ${data.timeSlot}!`,
            )
          }
        }
        return data
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
      if (user?.role === 'admin' || user?.role === 'coordinator') return true
      if (user?.role === 'teacher') {
        return {
          teacher: { equals: user.id },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
}
