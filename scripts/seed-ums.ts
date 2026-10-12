// scripts/seed-ums.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import { getPayload } from 'payload'
import payloadConfig from '../src/payload.config'

if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = '865aafb986658f1b7b28727b865aafb986658f1b7b28727b'
}

const seed = async () => {
  const payload = await getPayload({ config: payloadConfig })

  console.log('🌱 Seeding UMS Database Started...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // ============================================================
  // 1. DEPARTMENTS
  // ============================================================
  console.log('\n🏛️  Seeding Departments...')
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
  // 2. BATCHES
  // ============================================================
  console.log('\n🎓 Seeding Batches...')
  const batches = [
    { department: 'CS', startYear: 2024, totalSemesters: '8' as const, session: '2024-2028' },
    { department: 'SE', startYear: 2024, totalSemesters: '8' as const, session: '2024-2028' },
    { department: 'IT', startYear: 2024, totalSemesters: '8' as const, session: '2024-2028' },
    { department: 'AI', startYear: 2024, totalSemesters: '8' as const, session: '2024-2028' },
    { department: 'DS', startYear: 2024, totalSemesters: '8' as const, session: '2024-2028' },
  ]

  const batchMap = new Map<string, number>()
  for (const b of batches) {
    const deptId = deptMap.get(b.department)
    if (!deptId) continue

    const existing = await payload.find({
      collection: 'batches',
      where: {
        and: [{ department: { equals: deptId } }, { startYear: { equals: b.startYear } }],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'batches',
        data: {
          department: deptId,
          startYear: b.startYear,
          totalSemesters: b.totalSemesters,
          currentSemesterNumber: 1,
          status: 'active',
          session: b.session,
        },
      } as any)
      batchMap.set(b.department, created.id)
      console.log(`  ✅ Batch ${b.department} ${b.startYear}`)
    } else {
      batchMap.set(b.department, existing.docs[0].id)
      console.log(`  ⏭️  Batch ${b.department} ${b.startYear} (already exists)`)
    }
  }

  // ============================================================
  // 3. SEMESTERS
  // ============================================================
  console.log('\n📅 Seeding Semesters...')
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
      session: 'Fall 2024',
      semesterNumber: '1',
      department: 'IT',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      isActive: true,
    },
    {
      session: 'Spring 2025',
      semesterNumber: '2',
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

    const batchId = batchMap.get(sem.department)
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
          ...(batchId && { batch: batchId }),
          startDate: sem.startDate,
          endDate: sem.endDate,
          isActive: sem.isActive,
        },
      } as any)
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
  // 4. USERS (Admin, Coordinators, Teachers, Students)
  // ============================================================
  console.log('\n👥 Seeding Users...')

  // 1 ADMIN
  const adminExists = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@ums.edu.pk' } },
    limit: 1,
  })

  let _adminId: number
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
      },
    } as any)
    _adminId = admin.id
    console.log('  ✅ Admin: admin@ums.edu.pk / admin123')
  } else {
    _adminId = adminExists.docs[0].id
    console.log('  ⏭️  Admin already exists')
  }

  // 5 COORDINATORS
  const coordinators = [
    { name: 'Coordinator CS', email: 'coordinator.cs@ums.edu.pk', department: 'CS' },
    { name: 'Coordinator SE', email: 'coordinator.se@ums.edu.pk', department: 'SE' },
    { name: 'Coordinator IT', email: 'coordinator.it@ums.edu.pk', department: 'IT' },
    { name: 'Coordinator AI', email: 'coordinator.ai@ums.edu.pk', department: 'AI' },
    { name: 'Coordinator DS', email: 'coordinator.ds@ums.edu.pk', department: 'DS' },
  ]

  for (const coord of coordinators) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: coord.email } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const deptId = deptMap.get(coord.department)

      await payload.create({
        collection: 'users',
        data: {
          name: coord.name,
          email: coord.email,
          password: 'coord123',
          role: 'coordinator',
          status: 'active',
          coordinatorInfo: {
            departments: deptId ? [deptId] : [],
            qualification: 'PhD in Computer Science',
            joiningDate: '2015-01-01',
          },
          personalInfo: {
            phone: '+92 300 3333333',
            dateOfBirth: '1988-01-15',
            gender: 'male',
            cnic: '33333-3333333-3',
          },
          address: { street: 'Coordinator Office', city: 'Lahore', state: 'Punjab' },
        },
      } as any)
      console.log(`  ✅ Coordinator created: ${coord.email}`)
    } else {
      console.log(`  ⏭️  Coordinator already exists: ${coord.email}`)
    }
  }

  // 10 TEACHERS
  const teachers = [
    { name: 'Dr. Ali Ahmed', email: 'teacher.1@ums.edu.pk', designation: 'Permanent' },
    { name: 'Dr. Sara Khan', email: 'teacher.2@ums.edu.pk', designation: 'Permanent' },
    { name: 'Prof. Ahmed Raza', email: 'teacher.3@ums.edu.pk', designation: 'Permanent' },
    { name: 'Dr. Fatima Zahra', email: 'teacher.4@ums.edu.pk', designation: 'visiting' },
    { name: 'Dr. Usman Ali', email: 'teacher.5@ums.edu.pk', designation: 'Permanent' },
    { name: 'Dr. Ayesha Noor', email: 'teacher.6@ums.edu.pk', designation: 'visiting' },
    { name: 'Prof. Bilal Malik', email: 'teacher.7@ums.edu.pk', designation: 'Permanent' },
    { name: 'Dr. Hina Javed', email: 'teacher.8@ums.edu.pk', designation: 'Permanent' },
    { name: 'Dr. Kamran Shah', email: 'teacher.9@ums.edu.pk', designation: 'visiting' },
    { name: 'Dr. Sana Mirza', email: 'teacher.10@ums.edu.pk', designation: 'Permanent' },
  ]

  const teacherIds: number[] = []
  for (const teacher of teachers) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: teacher.email } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'users',
        data: {
          name: teacher.name,
          email: teacher.email,
          password: 'teacher123',
          role: 'teacher',
          status: 'active',
          teacherInfo: {
            designation: teacher.designation,
            qualification: 'PhD in relevant field',
            joiningDate: '2018-01-01',
          },
          personalInfo: {
            phone: '+92 300 4444444',
            dateOfBirth: '1990-01-15',
            gender: 'male',
            cnic: '44444-4444444-4',
          },
          address: { street: 'Faculty Block', city: 'Lahore', state: 'Punjab' },
        },
      } as any)
      teacherIds.push(created.id)
      console.log(`  ✅ Teacher created: ${teacher.email}`)
    } else {
      teacherIds.push(existing.docs[0].id)
      console.log(`  ⏭️  Teacher already exists: ${teacher.email}`)
    }
  }

  // 20 STUDENT USERS & STUDENT PROFILES
  console.log('\n🎒 Seeding Students...')
  const studentDocMap = new Map<string, number>()
  const studentDocIds: number[] = []

  const students = []
  for (let i = 1; i <= 20; i++) {
    students.push({
      name: `Student ${i}`,
      email: `student.${i}@ums.edu.pk`,
      rollNo: `CS-2024-${String(i).padStart(3, '0')}`,
    })
  }

  const deptCsId = deptMap.get('CS')
  const batchCsId = batchMap.get('CS')
  const semCsId = semMap.get('CS-Fall 2024-1')

  for (const student of students) {
    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: student.email } },
      limit: 1,
    })

    let userId: number
    if (existingUser.docs.length === 0) {
      const user = await payload.create({
        collection: 'users',
        data: {
          name: student.name,
          email: student.email,
          password: 'student123',
          role: 'student',
          status: 'active',
          personalInfo: {
            phone: '+92 300 5555555',
            dateOfBirth: '2002-01-15',
            gender: 'male',
            cnic: '55555-5555555-5',
          },
          address: { street: 'Student Hostel', city: 'Lahore', state: 'Punjab' },
        },
      } as any)
      userId = user.id
    } else {
      userId = existingUser.docs[0].id
    }

    // Check or create Student record
    const existingStudent = await payload.find({
      collection: 'students',
      where: { rollNo: { equals: student.rollNo } },
      limit: 1,
    })

    if (existingStudent.docs.length === 0) {
      if (deptCsId) {
        const studentDoc = await payload.create({
          collection: 'students',
          data: {
            rollNo: student.rollNo,
            user: userId,
            department: deptCsId,
            ...(batchCsId && { batch: batchCsId }),
            ...(semCsId && { semester: semCsId }),
            admissionDate: '2024-09-01',
            status: 'active',
          },
        } as any)
        studentDocMap.set(student.rollNo, studentDoc.id)
        studentDocIds.push(studentDoc.id)
        console.log(`  ✅ Student created: ${student.email} (${student.rollNo})`)
      }
    } else {
      studentDocMap.set(student.rollNo, existingStudent.docs[0].id)
      studentDocIds.push(existingStudent.docs[0].id)
      console.log(`  ⏭️  Student record exists: ${student.rollNo}`)
    }
  }

  // ============================================================
  // 5. COURSES
  // ============================================================
  console.log('\n📚 Seeding Courses...')
  const courses = [
    {
      title: 'Introduction to Programming',
      code: 'CS101',
      creditHours: 3,
      department: 'CS',
      teacherIndex: 0,
    },
    {
      title: 'Object Oriented Programming',
      code: 'CS201',
      creditHours: 3,
      department: 'CS',
      teacherIndex: 1,
    },
    {
      title: 'Data Structures & Algorithms',
      code: 'CS301',
      creditHours: 3,
      department: 'CS',
      teacherIndex: 2,
    },
    { title: 'Database Systems', code: 'CS401', creditHours: 3, department: 'CS', teacherIndex: 3 },
    { title: 'Web Development', code: 'SE201', creditHours: 3, department: 'SE', teacherIndex: 4 },
    {
      title: 'Software Engineering',
      code: 'SE301',
      creditHours: 3,
      department: 'SE',
      teacherIndex: 5,
    },
    { title: 'Calculus I', code: 'MATH101', creditHours: 3, department: 'MATH', teacherIndex: 6 },
    {
      title: 'Linear Algebra',
      code: 'MATH201',
      creditHours: 3,
      department: 'MATH',
      teacherIndex: 6,
    },
    { title: 'Mechanics', code: 'PHY101', creditHours: 3, department: 'PHY', teacherIndex: 7 },
    {
      title: 'University Writing',
      code: 'ENG101',
      creditHours: 2,
      department: 'ENG',
      teacherIndex: 8,
    },
  ]

  const courseMap = new Map<string, number>()
  for (const course of courses) {
    const deptId = deptMap.get(course.department)
    if (deptId === undefined) continue

    const semKey = `${course.department}-Fall 2024-1`
    const semId = semMap.get(semKey) || semCsId
    const teacherId = teacherIds[course.teacherIndex] || null

    const existing = await payload.find({
      collection: 'courses',
      where: { code: { equals: course.code } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const courseData: any = {
        title: course.title,
        code: course.code,
        creditHours: course.creditHours,
        department: deptId,
      }
      if (semId) courseData.semester = semId
      if (teacherId) courseData.teacher = teacherId

      const created = await payload.create({
        collection: 'courses',
        data: courseData,
      })
      courseMap.set(course.code, created.id)
      console.log(`  ✅ ${course.code}: ${course.title}`)
    } else {
      courseMap.set(course.code, existing.docs[0].id)
      console.log(`  ⏭️  ${course.code} (already exists)`)
    }
  }

  // ============================================================
  // 6. CLASSES (Sections)
  // ============================================================
  console.log('\n🏫 Seeding Classes...')
  const classesToSeed = [
    {
      courseCode: 'CS101',
      section: 'A',
      department: 'CS',
      teacherIndex: 0,
      days: ['monday', 'wednesday'] as const,
      timeSlot: '09:00-10:00' as const,
      lectureType: 'theory' as const,
    },
    {
      courseCode: 'CS101',
      section: 'B',
      department: 'CS',
      teacherIndex: 1,
      days: ['tuesday', 'thursday'] as const,
      timeSlot: '10:00-11:00' as const,
      lectureType: 'theory' as const,
    },
    {
      courseCode: 'CS201',
      section: 'A',
      department: 'CS',
      teacherIndex: 2,
      days: ['monday', 'wednesday'] as const,
      timeSlot: '11:00-12:00' as const,
      lectureType: 'theory' as const,
    },
    {
      courseCode: 'MATH101',
      section: 'A',
      department: 'MATH',
      teacherIndex: 6,
      days: ['tuesday', 'friday'] as const,
      timeSlot: '08:00-09:00' as const,
      lectureType: 'theory' as const,
    },
    {
      courseCode: 'ENG101',
      section: 'A',
      department: 'ENG',
      teacherIndex: 8,
      days: ['thursday', 'friday'] as const,
      timeSlot: '13:00-14:00' as const,
      lectureType: 'theory' as const,
    },
  ]

  const classMap = new Map<string, number>()
  for (const c of classesToSeed) {
    const courseId = courseMap.get(c.courseCode)
    const deptId = deptMap.get(c.department)
    const teacherId = teacherIds[c.teacherIndex]

    if (!courseId || !deptId || !teacherId) continue

    const semId = semCsId
    const key = `${c.courseCode}-${c.section}`

    const existing = await payload.find({
      collection: 'classes',
      where: {
        and: [
          { course: { equals: courseId } },
          { section: { equals: c.section } },
          { semester: { equals: semId } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'classes',
        data: {
          section: c.section,
          department: deptId,
          course: courseId,
          semester: semId,
          teacher: teacherId,
          ...(batchCsId && { batch: batchCsId }),
          days: [...c.days],
          timeSlot: c.timeSlot,
          lectureType: c.lectureType,
          status: 'ongoing',
        },
      } as any)
      classMap.set(key, created.id)
      console.log(`  ✅ Class created: ${c.courseCode} Section ${c.section}`)
    } else {
      classMap.set(key, existing.docs[0].id)
      console.log(`  ⏭️  Class exists: ${c.courseCode} Section ${c.section}`)
    }
  }

  // ============================================================
  // 7. ENROLLMENTS
  // ============================================================
  console.log('\n📝 Seeding Enrollments...')
  const classCs101A = classMap.get('CS101-A')
  const classCs101B = classMap.get('CS101-B')
  const classCs201A = classMap.get('CS201-A')
  const classMath101A = classMap.get('MATH101-A')
  const classEng101A = classMap.get('ENG101-A')

  // Students 1-10 enrolled in CS101-A, CS201-A, MATH101-A, ENG101-A
  // Students 11-20 enrolled in CS101-B, CS201-A, MATH101-A, ENG101-A
  const enrollmentPairs: Array<{ studentId: number; classId: number; deptId: number }> = []

  for (let i = 0; i < studentDocIds.length; i++) {
    const studentId = studentDocIds[i]
    if (i < 10 && classCs101A && deptCsId) {
      enrollmentPairs.push({ studentId, classId: classCs101A, deptId: deptCsId })
    } else if (i >= 10 && classCs101B && deptCsId) {
      enrollmentPairs.push({ studentId, classId: classCs101B, deptId: deptCsId })
    }

    if (classCs201A && deptCsId) {
      enrollmentPairs.push({ studentId, classId: classCs201A, deptId: deptCsId })
    }

    const deptMathId = deptMap.get('MATH')
    if (classMath101A && deptMathId) {
      enrollmentPairs.push({ studentId, classId: classMath101A, deptId: deptMathId })
    }

    const deptEngId = deptMap.get('ENG')
    if (classEng101A && deptEngId) {
      enrollmentPairs.push({ studentId, classId: classEng101A, deptId: deptEngId })
    }
  }

  let enrolledCount = 0
  for (const ep of enrollmentPairs) {
    const existing = await payload.find({
      collection: 'enrollments',
      where: {
        and: [{ student: { equals: ep.studentId } }, { class: { equals: ep.classId } }],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'enrollments',
        data: {
          department: ep.deptId,
          student: ep.studentId,
          class: ep.classId,
          status: 'enrolled',
        },
      } as any)
      enrolledCount++
    }
  }
  console.log(`  ✅ Total Enrollments added: ${enrolledCount}`)

  // ============================================================
  // 8. ATTENDANCE
  // ============================================================
  console.log('\n📋 Seeding Attendance...')
  const attendanceDates = ['2024-10-07', '2024-10-09', '2024-10-14']
  let attendanceCount = 0

  if (classCs101A && teacherIds[0]) {
    const studentsInClassA = studentDocIds.slice(0, 10)
    for (const date of attendanceDates) {
      for (let idx = 0; idx < studentsInClassA.length; idx++) {
        const studentId = studentsInClassA[idx]
        // 8th student absent occasionally, others present
        const status = idx === 7 ? 'absent' : idx === 4 ? 'late' : 'present'

        const existing = await payload.find({
          collection: 'attendance',
          where: {
            and: [
              { student: { equals: studentId } },
              { class: { equals: classCs101A } },
              { date: { equals: date } },
            ],
          },
          limit: 1,
        })

        if (existing.docs.length === 0) {
          await payload.create({
            collection: 'attendance',
            data: {
              student: studentId,
              class: classCs101A,
              date,
              status,
              markedBy: teacherIds[0],
              remarks: status === 'absent' ? 'Sick leave requested' : 'Regular lecture attendance',
            },
          } as any)
          attendanceCount++
        }
      }
    }
  }
  console.log(`  ✅ Total Attendance records added: ${attendanceCount}`)

  // ============================================================
  // 9. TIMETABLE
  // ============================================================
  console.log('\n⏰ Seeding Timetable...')
  const timetableEntries = [
    {
      classKey: 'CS101-A',
      courseCode: 'CS101',
      teacherIndex: 0,
      department: 'CS',
      day: 'monday' as const,
      timeSlot: '09:00-10:00' as const,
      room: 'Room 101',
      lectureType: 'theory' as const,
    },
    {
      classKey: 'CS101-A',
      courseCode: 'CS101',
      teacherIndex: 0,
      department: 'CS',
      day: 'wednesday' as const,
      timeSlot: '09:00-10:00' as const,
      room: 'Room 101',
      lectureType: 'theory' as const,
    },
    {
      classKey: 'CS101-B',
      courseCode: 'CS101',
      teacherIndex: 1,
      department: 'CS',
      day: 'tuesday' as const,
      timeSlot: '10:00-11:00' as const,
      room: 'Room 102',
      lectureType: 'theory' as const,
    },
    {
      classKey: 'CS101-B',
      courseCode: 'CS101',
      teacherIndex: 1,
      department: 'CS',
      day: 'thursday' as const,
      timeSlot: '10:00-11:00' as const,
      room: 'Room 102',
      lectureType: 'theory' as const,
    },
    {
      classKey: 'CS201-A',
      courseCode: 'CS201',
      teacherIndex: 2,
      department: 'CS',
      day: 'monday' as const,
      timeSlot: '11:00-12:00' as const,
      room: 'Lab 1',
      lectureType: 'lab' as const,
    },
    {
      classKey: 'CS201-A',
      courseCode: 'CS201',
      teacherIndex: 2,
      department: 'CS',
      day: 'wednesday' as const,
      timeSlot: '11:00-12:00' as const,
      room: 'Lab 1',
      lectureType: 'lab' as const,
    },
    {
      classKey: 'MATH101-A',
      courseCode: 'MATH101',
      teacherIndex: 6,
      department: 'MATH',
      day: 'tuesday' as const,
      timeSlot: '08:00-09:00' as const,
      room: 'Room 101',
      lectureType: 'theory' as const,
    },
    {
      classKey: 'ENG101-A',
      courseCode: 'ENG101',
      teacherIndex: 8,
      department: 'ENG',
      day: 'thursday' as const,
      timeSlot: '13:00-14:00' as const,
      room: 'Room 103',
      lectureType: 'theory' as const,
    },
  ]

  let timetableCount = 0
  for (const tt of timetableEntries) {
    const classId = classMap.get(tt.classKey)
    const subjectId = courseMap.get(tt.courseCode)
    const teacherId = teacherIds[tt.teacherIndex]
    const deptId = deptMap.get(tt.department)

    if (!classId || !subjectId || !teacherId || !deptId || !semCsId) continue

    const existing = await payload.find({
      collection: 'timetable',
      where: {
        and: [
          { class: { equals: classId } },
          { day: { equals: tt.day } },
          { timeSlot: { equals: tt.timeSlot } },
          { semester: { equals: semCsId } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'timetable',
        data: {
          department: deptId,
          semester: semCsId,
          class: classId,
          subject: subjectId,
          teacher: teacherId,
          day: tt.day,
          timeSlot: tt.timeSlot,
          room: tt.room,
          lectureType: tt.lectureType,
          status: 'active',
        },
      } as any)
      timetableCount++
    }
  }
  console.log(`  ✅ Total Timetable slots created: ${timetableCount}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 UMS Full Database Seed Complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed().catch((error) => {
  console.error('❌ Seed error:', error)
  process.exit(1)
})
