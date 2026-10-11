// collections/Grades.ts
import { CollectionConfig } from 'payload'

export const Grades: CollectionConfig = {
  slug: 'grades',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Academic',
    defaultColumns: ['displayTitle', 'student', 'exam', 'obtainedMarks', 'grade'],
    description: 'Track student grades and marks',
  },
  fields: [
    // ===== DISPLAY TITLE (Auto-generated) =====
    {
      name: 'displayTitle',
      type: 'text',
      label: 'Grade Record',
      admin: {
        readOnly: true,
        description: 'Auto-generated: Student - Exam - Marks',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req, context }) => {
            if (context.skipDisplayTitle) return data?.displayTitle || ''

            if (data?.student && data?.exam) {
              try {
                const student = await req.payload.findByID({
                  collection: 'students',
                  id: data.student,
                  depth: 0,
                  req,
                })
                const exam = await req.payload.findByID({
                  collection: 'exams',
                  id: data.exam,
                  depth: 0,
                  req,
                })
                return `${student?.displayTitle || 'Student'} - ${exam?.title || 'Exam'} - ${data.obtainedMarks || 0}/${exam?.totalMarks || 0}`
              } catch {
                return `${data.student} - ${data.exam} - ${data.obtainedMarks || 0}`
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
        description: 'Student being graded',
      },
    },

    // ===== EXAM =====
    {
      name: 'exam',
      type: 'relationship',
      relationTo: 'exams',
      required: true,
      label: 'Exam',
      admin: {
        description: 'Exam this grade is for',
      },
    },

    // ===== OBTAINED MARKS =====
    {
      name: 'obtainedMarks',
      type: 'number',
      required: true,
      label: 'Obtained Marks',
      min: 0,
      admin: {
        description: 'Marks obtained by student',
      },
    },

    // ===== GRADE LETTER =====
    {
      name: 'grade',
      type: 'select',
      required: true,
      label: 'Grade',
      options: [
        { label: 'A+', value: 'A+' },
        { label: 'A', value: 'A' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B', value: 'B' },
        { label: 'B-', value: 'B-' },
        { label: 'C+', value: 'C+' },
        { label: 'C', value: 'C' },
        { label: 'C-', value: 'C-' },
        { label: 'D', value: 'D' },
        { label: 'F', value: 'F' },
      ],
      admin: {
        description: 'Letter grade based on marks',
      },
    },

    // ===== GPA =====
    {
      name: 'gpa',
      type: 'number',
      label: 'GPA',
      min: 0,
      max: 4,
      step: 0.1,
      admin: {
        description: 'Grade Point Average (0-4)',
      },
    },

    // ===== REMARKS =====
    {
      name: 'remarks',
      type: 'textarea',
      label: 'Remarks',
      admin: {
        description: 'Teacher comments on performance',
      },
    },

    // ===== GRADED BY =====
    {
      name: 'gradedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Graded By',
      filterOptions: {
        role: { equals: 'teacher' },
      },
      admin: {
        description: 'Teacher who graded this',
      },
    },

    // ===== GRADING DATE =====
    {
      name: 'gradingDate',
      type: 'date',
      label: 'Grading Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        defaultValue: () => new Date().toISOString(),
      },
    },
  ],

  // ===== INDEXES =====
  indexes: [
    { fields: ['student'] },
    { fields: ['exam'] },
    { fields: ['grade'] },
    { fields: ['gradingDate'] },
    {
      fields: ['student', 'exam'],
      unique: true, // One grade per student per exam
    },
  ],

  // ===== HOOKS =====
  hooks: {
    beforeChange: [
      async ({ data, req, context }) => {
        // Skip if this is a recursive call
        if (context.skipGradeAutoFill) return data

        // Auto-calculate grade based on marks if exam is provided
        if (data?.exam && data?.obtainedMarks !== undefined) {
          try {
            const exam = await req.payload.findByID({
              collection: 'exams',
              id: data.exam,
              depth: 0,
              req,
            })

            if (exam?.totalMarks) {
              const percentage = (data.obtainedMarks / exam.totalMarks) * 100
              let grade = 'F'
              let gpa = 0

              if (percentage >= 90) {
                grade = 'A+'
                gpa = 4.0
              } else if (percentage >= 85) {
                grade = 'A'
                gpa = 3.9
              } else if (percentage >= 80) {
                grade = 'A-'
                gpa = 3.7
              } else if (percentage >= 75) {
                grade = 'B+'
                gpa = 3.3
              } else if (percentage >= 70) {
                grade = 'B'
                gpa = 3.0
              } else if (percentage >= 65) {
                grade = 'B-'
                gpa = 2.7
              } else if (percentage >= 60) {
                grade = 'C+'
                gpa = 2.3
              } else if (percentage >= 55) {
                grade = 'C'
                gpa = 2.0
              } else if (percentage >= 50) {
                grade = 'C-'
                gpa = 1.7
              } else if (percentage >= 40) {
                grade = 'D'
                gpa = 1.0
              } else {
                grade = 'F'
                gpa = 0.0
              }

              data.grade = grade
              data.gpa = gpa
            }
          } catch {
            // Keep user-provided grade and GPA
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
      // Teachers can see grades for their exams
      if (user?.role === 'teacher') {
        return { exam: { class: { teacher: { equals: user.id } } } }
      }
      // Students can see their own grades
      if (user?.role === 'student') {
        return { student: { user: { equals: user.id } } }
      }
      // Admin and coordinator can see all
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    create: ({ req: { user } }) => {
      if (user?.role === 'teacher') {
        return { exam: { class: { teacher: { equals: user.id } } } }
      }
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'teacher') {
        return { exam: { class: { teacher: { equals: user.id } } } }
      }
      return user?.role === 'admin' || user?.role === 'coordinator'
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
