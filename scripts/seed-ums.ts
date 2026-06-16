// scripts/seed-ums.ts
import { getPayload } from 'payload'
import payloadConfig from '../src/payload.config'

const seed = async () => {
  const payload = await getPayload({ config: payloadConfig })

  console.log('🌱 Seeding UMS Database Started...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // ============================================================
  // 1. DEPARTMENTS
  // ============================================================
  const departments = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Software Engineering', code: 'SE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Artificial Intelligence', code: 'AI' },
    { name: 'Data Science', code: 'DS' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'English Literature', code: 'ENG' },
    { name: 'Economics', code: 'ECO' },
    { name: 'Business Administration', code: 'BBA' },
    { name: 'Accounting & Finance', code: 'AF' },
  ]

  const deptMap = new Map<string, number>()
  for (const dept of departments) {
    const existing = await payload.find({
      collection: 'departments',
      where: { code: { equals: dept.code } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'departments',
        data: dept,
      })
      deptMap.set(dept.code, created.id)
      console.log(`  ✅ ${dept.name} (${dept.code})`)
    } else {
      deptMap.set(dept.code, existing.docs[0].id)
      console.log(`  ⏭️  ${dept.name} (already exists)`)
    }
  }

  // ============================================================
  // 2. SEMESTERS
  // ============================================================
  const semesters: Array<{
    session: string
    semesterNumber: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
    department: string
    startDate: string
    endDate: string
    isActive: boolean
  }> = [
    {
      session: 'Fall 2024',
      semesterNumber: '1',
      department: 'CS',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      isActive: true,
    },
    {
      session: 'Fall 2024',
      semesterNumber: '1',
      department: 'SE',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      isActive: true,
    },
    {
      session: 'Spring 2025',
      semesterNumber: '1',
      department: 'CS',
      startDate: '2025-02-01',
      endDate: '2025-05-31',
      isActive: false,
    },
  ]

  const semMap = new Map<string, number>()
  for (const sem of semesters) {
    const deptId = deptMap.get(sem.department)
    if (deptId === undefined) continue

    const key = `${sem.department}-${sem.session}-${sem.semesterNumber}`
    const existing = await payload.find({
      collection: 'semesters',
      where: {
        and: [
          { session: { equals: sem.session } },
          { semesterNumber: { equals: sem.semesterNumber } },
          { department: { equals: deptId } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'semesters',
        data: {
          session: sem.session,
          semesterNumber: sem.semesterNumber,
          department: deptId,
          startDate: sem.startDate,
          endDate: sem.endDate,
          isActive: sem.isActive,
        } as any,
      })
      semMap.set(key, created.id)
      console.log(`  ✅ ${sem.department} - ${sem.session} - ${sem.semesterNumber} Semester`)
    } else {
      semMap.set(key, existing.docs[0].id)
      console.log(
        `  ⏭️  ${sem.department} - ${sem.session} - ${sem.semesterNumber} Semester (already exists)`,
      )
    }
  }

  // ============================================================
  // 3. COURSES
  // ============================================================
  const courses = [
    { title: 'Introduction to Programming', code: 'CS101', creditHours: 3, department: 'CS' },
    { title: 'Object Oriented Programming', code: 'CS201', creditHours: 3, department: 'CS' },
    { title: 'Data Structures & Algorithms', code: 'CS301', creditHours: 3, department: 'CS' },
    { title: 'Database Systems', code: 'CS401', creditHours: 3, department: 'CS' },
    { title: 'Web Development', code: 'SE201', creditHours: 3, department: 'SE' },
    { title: 'Software Engineering', code: 'SE301', creditHours: 3, department: 'SE' },
    { title: 'Calculus I', code: 'MATH101', creditHours: 3, department: 'MATH' },
    { title: 'Linear Algebra', code: 'MATH201', creditHours: 3, department: 'MATH' },
    { title: 'Mechanics', code: 'PHY101', creditHours: 3, department: 'PHY' },
    { title: 'University Writing', code: 'ENG101', creditHours: 2, department: 'ENG' },
  ]

  const courseMap = new Map<string, number>()
  for (const course of courses) {
    const deptId = deptMap.get(course.department)
    if (deptId === undefined) continue

    const existing = await payload.find({
      collection: 'courses',
      where: { code: { equals: course.code } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'courses',
        data: {
          title: course.title,
          code: course.code,
          creditHours: course.creditHours,
          department: deptId,
          teacher: null,
        } as any,
      })
      courseMap.set(course.code, created.id)
      console.log(`  ✅ ${course.code}: ${course.title}`)
    } else {
      courseMap.set(course.code, existing.docs[0].id)
      console.log(`  ⏭️  ${course.code} (already exists)`)
    }
  }

  // ============================================================
  // 4. USERS
  // ============================================================
  const adminExists = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@ums.edu.pk' } },
    limit: 1,
  })

  let adminId: number
  if (adminExists.docs.length === 0) {
    const admin = await payload.create({
      collection: 'users',
      data: {
        name: 'System Administrator',
        email: 'admin@ums.edu.pk',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        personalInfo: {
          phone: '+92 300 1111111',
          dateOfBirth: '1985-01-15',
          gender: 'male',
          cnic: '11111-1111111-1',
        },
        address: {
          street: 'Admin Block, Main Campus',
          city: 'Lahore',
          state: 'Punjab',
        },
      } as any,
    })
    adminId = admin.id
    console.log('  ✅ Admin: admin@ums.edu.pk / admin123')
  } else {
    adminId = adminExists.docs[0].id
    console.log('  ⏭️  Admin already exists')
  }

  // ============================================================
  // 5. TEACHERS
  // ============================================================
  const teachers = [
    { name: 'Teacher A', email: 'teacher.a@ums.edu.pk', role: 'teacher' },
    { name: 'Teacher B', email: 'teacher.b@ums.edu.pk', role: 'teacher' },
  ]

  for (const teacher of teachers) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: teacher.email } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          ...teacher,
          password: 'teacher123',
          status: 'active',
          personalInfo: {
            phone: '+92 300 2222222',
            dateOfBirth: '1990-01-15',
            gender: 'female',
            cnic: '22222-2222222-2',
          },
          address: { street: 'Faculty Block', city: 'Lahore', state: 'Punjab' },
        } as any,
      })
      console.log(`  ✅ Teacher created: ${teacher.email}`)
    } else {
      console.log(`  ⏭️  Teacher already exists: ${teacher.email}`)
    }
  }

  console.log('\n✅ Seed complete!')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
