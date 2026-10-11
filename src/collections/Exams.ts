// collections/Exams.ts
import { CollectionConfig } from 'payload'

export const Exams: CollectionConfig = {
  slug: 'exams',
  admin: {
    useAsTitle: 'title',
    group: 'Academic',
    defaultColumns: ['title', 'course', 'examType', 'examDate', 'status'],
    description: 'Manage exams and assessments',
  },
  fields: [
    // ===== TITLE =====
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Exam Title',
      admin: {
        description: 'e.g., Midterm Exam - Data Structures',
      },
    },

    // ===== COURSE =====
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
      admin: {
        description: 'Course this exam belongs to',
      },
    },

    // ===== CLASS =====
    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      label: 'Class',
      filterOptions: ({ data }) => {
        const courseId = typeof data?.course === 'object' ? data.course?.id : data?.course
        if (courseId) return { course: { equals: courseId } } as any
        return true
      },
      admin: {
        condition: (data) => Boolean(data?.course),
        description: 'Class section taking this exam',
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
        description: 'Semester this exam belongs to',
      },
    },

    // ===== EXAM TYPE =====
    {
      name: 'examType',
      type: 'select',
      required: true,
      label: 'Exam Type',
      options: [
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
        { label: 'Midterm', value: 'midterm' },
        { label: 'Final', value: 'final' },
        { label: 'Lab Test', value: 'lab_test' },
        { label: 'Project', value: 'project' },
        { label: 'Presentation', value: 'presentation' },
      ],
    },

    // ===== EXAM DATE =====
    {
      name: 'examDate',
      type: 'date',
      required: true,
      label: 'Exam Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },

    // ===== START TIME =====
    {
      name: 'startTime',
      type: 'text',
      label: 'Start Time',
      admin: {
        description: 'e.g., 09:00 AM',
      },
    },

    // ===== END TIME =====
    {
      name: 'endTime',
      type: 'text',
      label: 'End Time',
      admin: {
        description: 'e.g., 11:00 AM',
      },
    },

    // ===== VENUE =====
    {
      name: 'venue',
      type: 'text',
      label: 'Venue',
      admin: {
        description: 'Exam location/hall',
      },
    },

    // ===== TOTAL MARKS =====
    {
      name: 'totalMarks',
      type: 'number',
      required: true,
      label: 'Total Marks',
      min: 1,
      defaultValue: 100,
      admin: {
        description: 'Maximum marks for this exam',
      },
    },

    // ===== PASSING MARKS =====
    {
      name: 'passingMarks',
      type: 'number',
      required: true,
      label: 'Passing Marks',
      min: 0,
      defaultValue: 40,
      admin: {
        description: 'Minimum marks required to pass',
      },
    },

    // ===== DESCRIPTION =====
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Exam instructions or syllabus coverage',
      },
    },

    // ===== STATUS =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      label: 'Status',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    { fields: ['course'] },
    { fields: ['class'] },
    { fields: ['semester'] },
    { fields: ['examDate'] },
    { fields: ['status'] },
  ],

  // ===== ACCESS CONTROL =====
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Teachers can see exams for their classes
      if (user?.role === 'teacher') {
        return { class: { teacher: { equals: user.id } } } as any
      }
      // Students can see exams for their enrolled classes
      if (user?.role === 'student') {
        return true // Can filter at enrollment level
      }
      // Admin and coordinator can see all
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    create: ({ req: { user } }) => {
      if (user?.role === 'teacher') {
        return { class: { teacher: { equals: user.id } } } as any
      }
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'teacher') {
        return { class: { teacher: { equals: user.id } } } as any
      }
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
