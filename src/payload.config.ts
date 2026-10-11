import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import nodemailer from 'nodemailer'

// Email service utility
export const sendEmail = async (options: {
  to: string
  subject: string
  html?: string
  text?: string
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

import { Users } from './collections/Users'
import { Departments } from './collections/Departments'
import { Semesters } from './collections/Semesters'
import { Courses } from './collections/Courses'
import { Classes } from './collections/Classes'
import { Students } from './collections/Students'
import { Batches } from './collections/Batches'
import { Enrollments } from './collections/Enrollments'
import { TimeTable } from './collections/TimeTable'
import { TeacherSalary } from './collections/TeacherSalary'
import { Attendance } from './collections/Attendance'
import { FeeStructure } from './collections/FeeStructure'
import { FeePayments } from './collections/FeePayments'
import { Exams } from './collections/Exams'
import { Grades } from './collections/Grades'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Departments,
    Batches,
    Semesters,
    Courses,
    Classes,
    Students,
    Enrollments,
    TimeTable,
    TeacherSalary,
    Attendance,
    FeeStructure,
    FeePayments,
    Exams,
    Grades,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
