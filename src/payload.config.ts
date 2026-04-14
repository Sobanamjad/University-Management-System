import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Departments } from './collections/Departments'
import { Universities } from './collections/Universities'
import { Semesters } from './collections/Semesters'
import { Courses } from './collections/Courses'
import { Classes } from './collections/Classes'
import { Students } from './collections/Students'
import { Enrollments } from './collections/Enrollments'
import { TimeTable } from './collections/TimeTable'

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
    Universities,
    Semesters,
    Courses,
    Classes,
    Students,
    Enrollments,
    TimeTable,
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
