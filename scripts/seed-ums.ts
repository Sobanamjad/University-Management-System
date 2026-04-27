// scripts/seed-ums.ts
import { getPayload } from 'payload'
import payloadConfig from '../src/payload.config'

const seed = async () => {
  const payload = await getPayload({ config: payloadConfig })

  console.log('🌱 Seeding UMS Database Started...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // ============================================================
  // 1. UNIVERSITIES
  // ============================================================
  console.log('\n📚 Creating Universities...')

  const universities = [
    { name: 'University of the Punjab', status: 'active' },
    { name: 'University of Karachi', status: 'active' },
    { name: 'Lahore University of Management Sciences', status: 'active' },
    { name: 'National University of Sciences & Technology', status: 'active' },
    { name: 'COMSATS University Islamabad', status: 'active' },
  ]

  const uniMap = new Map()
  for (const uni of universities) {
    let existing = await payload.find({
      collection: 'universities',
      where: { name: { equals: uni.name } },
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({ collection: 'universities', data: uni })
      uniMap.set(uni.name, created.id)
      console.log(`  ✅ ${uni.name}`)
    } else {
      uniMap.set(uni.name, existing.docs[0].id)
      console.log(`  ⏭️  ${uni.name} (already exists)`)
    }
  }

  // ============================================================
  // 2. DEPARTMENTS
  // ============================================================
  console.log('\n🏛️ Creating Departments...')

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

  const deptMap = new Map()
  for (const dept of departments) {
    let existing = await payload.find({
      collection: 'departments',
      where: { code: { equals: dept.code } },
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({ collection: 'departments', data: dept })
      deptMap.set(dept.code, created.id)
      console.log(`  ✅ ${dept.name} (${dept.code})`)
    } else {
      deptMap.set(dept.code, existing.docs[0].id)
      console.log(`  ⏭️  ${dept.name} (already exists)`)
    }
  }

  // ============================================================
  // 3. SEMESTERS
  // ============================================================
  console.log('\n📅 Creating Semesters...')

  const semesters = [
    {
      session: 'Fall 2024',
      semesterNumber: '1',
      university: 'University of the Punjab',
      department: 'CS',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      isActive: true,
    },
    {
      session: 'Fall 2024',
      semesterNumber: '2',
      university: 'University of the Punjab',
      department: 'CS',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      isActive: false,
    },
    {
      session: 'Spring 2025',
      semesterNumber: '1',
      university: 'University of the Punjab',
      department: 'CS',
      startDate: '2025-02-01',
      endDate: '2025-05-31',
      isActive: false,
    },
    {
      session: 'Fall 2024',
      semesterNumber: '1',
      university: 'University of the Punjab',
      department: 'SE',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      isActive: true,
    },
  ]

  const semMap = new Map()
  for (const sem of semesters) {
    const uniId = uniMap.get(sem.university)
    const deptId = deptMap.get(sem.department)

    if (!uniId || !deptId) continue

    let existing = await payload.find({
      collection: 'semesters',
      where: {
        and: [
          { session: { equals: sem.session } },
          { semesterNumber: { equals: sem.semesterNumber } },
          { department: { equals: deptId } },
          { university: { equals: uniId } },
        ],
      },
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'semesters',
        data: {
          session: sem.session,
          semesterNumber: sem.semesterNumber,
          university: uniId,
          department: deptId,
          startDate: sem.startDate,
          endDate: sem.endDate,
          isActive: sem.isActive,
        },
      })
      const key = `${sem.department}-${sem.session}-${sem.semesterNumber}`
      semMap.set(key, created.id)
      console.log(`  ✅ ${sem.department} - ${sem.session} - ${sem.semesterNumber} Semester`)
    } else {
      const key = `${sem.department}-${sem.session}-${sem.semesterNumber}`
      semMap.set(key, existing.docs[0].id)
      console.log(
        `  ⏭️  ${sem.department} - ${sem.session} - ${sem.semesterNumber} Semester (already exists)`,
      )
    }
  }

  // ============================================================
  // 4. COURSES
  // ============================================================
  console.log('\n📖 Creating Courses...')

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
    { title: 'Academic Writing', code: 'ENG101', creditHours: 2, department: 'ENG' },
  ]

  const courseMap = new Map()
  for (const course of courses) {
    const deptId = deptMap.get(course.department)
    const uniId = uniMap.get('University of the Punjab')
    const semKey = `${course.department}-Fall 2024-1`
    const semId = semMap.get(semKey)

    if (!deptId || !uniId || !semId) {
      console.log(`  ⚠️ Skipping ${course.code} - missing dependencies`)
      continue
    }

    let existing = await payload.find({
      collection: 'courses',
      where: { code: { equals: course.code } },
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'courses',
        data: {
          title: course.title,
          code: course.code,
          creditHours: course.creditHours,
          department: deptId,
          university: uniId,
          semester: semId,
          teacher: null,
        },
      })
      courseMap.set(course.code, created.id)
      console.log(`  ✅ ${course.code}: ${course.title}`)
    } else {
      courseMap.set(course.code, existing.docs[0].id)
      console.log(`  ⏭️  ${course.code} (already exists)`)
    }
  }

  // ============================================================
  // 5. USERS - ADMIN
  // ============================================================
  console.log('\n👑 Creating Admin User...')

  const adminExists = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@ums.edu.pk' } },
  })

  let adminId
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
    })
    adminId = admin.id
    console.log('  ✅ Admin: admin@ums.edu.pk / admin123')
  } else {
    adminId = adminExists.docs[0].id
    console.log('  ⏭️  Admin already exists')
  }

  // ============================================================
  // 6. USERS - COORDINATOR (Multiple Departments - Array)
  // ============================================================
  console.log('\n👔 Creating Coordinator (with multiple departments)...')

  const coordinatorExists = await payload.find({
    collection: 'users',
    where: { email: { equals: 'coordinator@ums.edu.pk' } },
  })

  let coordinatorId
  if (coordinatorExists.docs.length === 0) {
    const csDeptId = deptMap.get('CS')
    const seDeptId = deptMap.get('SE')
    const itDeptId = deptMap.get('IT')

    const coordinator = await payload.create({
      collection: 'users',
      data: {
        name: 'Dr. Imran Ahmed',
        email: 'coordinator@ums.edu.pk',
        password: 'coord123',
        role: 'coordinator',
        status: 'active',
        coordinatorInfo: {
          departments: [csDeptId, seDeptId, itDeptId], // ✅ ARRAY for multiple departments
          qualification: 'PhD Computer Science',
          joiningDate: '2023-08-01',
        },
        personalInfo: {
          phone: '+92 300 2222222',
          dateOfBirth: '1980-05-20',
          gender: 'male',
          cnic: '22222-2222222-2',
        },
        address: {
          street: 'Staff Colony',
          city: 'Lahore',
          state: 'Punjab',
        },
      },
    })
    coordinatorId = coordinator.id
    console.log('  ✅ Coordinator: coordinator@ums.edu.pk / coord123 (CS, SE, IT)')
  } else {
    coordinatorId = coordinatorExists.docs[0].id
    console.log('  ⏭️  Coordinator already exists')
  }

  // ============================================================
  // 7. USERS - TEACHER
  // ============================================================
  console.log('\n👨‍🏫 Creating Teachers...')

  const teachers = [
    {
      name: 'Dr. Ali Raza',
      email: 'ali.raza@ums.edu.pk',
      password: 'teacher123',
      designation: 'Permanent',
      qualification: 'PhD Computer Science',
      department: 'CS',
      joiningDate: '2024-01-15',
    },
    {
      name: 'Dr. Sara Ahmed',
      email: 'sara.ahmed@ums.edu.pk',
      password: 'teacher123',
      designation: 'Permanent',
      qualification: 'PhD Software Engineering',
      department: 'SE',
      joiningDate: '2024-01-15',
    },
    {
      name: 'Mr. Usman Malik',
      email: 'usman.malik@ums.edu.pk',
      password: 'teacher123',
      designation: 'visiting',
      qualification: 'MS Mathematics',
      department: 'MATH',
      joiningDate: '2024-08-01',
    },
  ]

  const teacherMap = new Map()
  for (const teacher of teachers) {
    const exists = await payload.find({
      collection: 'users',
      where: { email: { equals: teacher.email } },
    })

    const deptId = deptMap.get(teacher.department)
    if (!deptId) {
      console.log(`  ⚠️ Skipping ${teacher.name} - department not found`)
      continue
    }

    let userId
    if (exists.docs.length === 0) {
      const created = await payload.create({
        collection: 'users',
        data: {
          name: teacher.name,
          email: teacher.email,
          password: teacher.password,
          role: 'teacher',
          status: 'active',
          teacherInfo: {
            department: deptId,
            designation: teacher.designation,
            qualification: teacher.qualification,
            joiningDate: teacher.joiningDate,
          },
          personalInfo: {
            phone: '+92 300 3333333',
            dateOfBirth: '1985-03-10',
            gender: 'male',
            cnic: '33333-3333333-3',
          },
          address: {
            street: 'Teachers Colony',
            city: 'Lahore',
            state: 'Punjab',
          },
        },
      })
      userId = created.id
      teacherMap.set(teacher.email, userId)
      console.log(`  ✅ ${teacher.name} (${teacher.department} - ${teacher.designation})`)
    } else {
      teacherMap.set(teacher.email, exists.docs[0].id)
      console.log(`  ⏭️  ${teacher.name} (already exists)`)
    }
  }

  // Assign teachers to courses
  console.log('\n📖 Assigning Teachers to Courses...')

  const csTeacherId = teacherMap.get('ali.raza@ums.edu.pk')
  if (csTeacherId && courseMap.has('CS101')) {
    await payload.update({
      collection: 'courses',
      id: courseMap.get('CS101'),
      data: { teacher: csTeacherId },
    })
    console.log('  ✅ CS101 assigned to Dr. Ali Raza')
  }

  // ============================================================
  // 8. CLASSES
  // ============================================================
  console.log('\n📚 Creating Classes...')

  const classes = [
    {
      course: 'CS101',
      section: 'A',
      teacher: 'ali.raza@ums.edu.pk',
      days: ['monday', 'wednesday'],
      timeSlot: '09:00-10:00',
      room: 'Lab 1',
      maxStudents: 30,
      lectureType: 'theory',
    },
    {
      course: 'CS101',
      section: 'B',
      teacher: 'ali.raza@ums.edu.pk',
      days: ['tuesday', 'thursday'],
      timeSlot: '09:00-10:00',
      room: 'Lab 2',
      maxStudents: 30,
      lectureType: 'theory',
    },
    {
      course: 'CS201',
      section: 'A',
      teacher: 'ali.raza@ums.edu.pk',
      days: ['monday', 'wednesday'],
      timeSlot: '10:00-11:00',
      room: 'Room 101',
      maxStudents: 35,
      lectureType: 'theory',
    },
    {
      course: 'SE201',
      section: 'A',
      teacher: 'sara.ahmed@ums.edu.pk',
      days: ['tuesday', 'thursday'],
      timeSlot: '11:00-12:00',
      room: 'Lab 3',
      maxStudents: 25,
      lectureType: 'theory',
    },
  ]

  const classMap = new Map()
  for (const classItem of classes) {
    const courseId = courseMap.get(classItem.course)
    const teacherId = teacherMap.get(classItem.teacher)
    const deptId = deptMap.get(classItem.course.startsWith('CS') ? 'CS' : 'SE')
    const uniId = uniMap.get('University of the Punjab')
    const semKey = `${deptId === deptMap.get('CS') ? 'CS' : 'SE'}-Fall 2024-1`
    const semId = semMap.get(semKey)

    if (!courseId || !teacherId || !deptId || !uniId || !semId) {
      console.log(
        `  ⚠️ Skipping ${classItem.course} Section ${classItem.section} - missing dependencies`,
      )
      continue
    }

    let existing = await payload.find({
      collection: 'classes',
      where: {
        and: [
          { course: { equals: courseId } },
          { section: { equals: classItem.section } },
          { semester: { equals: semId } },
        ],
      },
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'classes',
        data: {
          section: classItem.section,
          university: uniId,
          department: deptId,
          course: courseId,
          semester: semId,
          teacher: teacherId,
          days: classItem.days,
          timeSlot: classItem.timeSlot,
          maxStudents: classItem.maxStudents,
          currentStudents: 0,
          lectureType: classItem.lectureType,
          status: 'scheduled',
        },
      })
      const key = `${classItem.course}-${classItem.section}`
      classMap.set(key, created.id)
      console.log(`  ✅ ${classItem.course} - Section ${classItem.section}`)
    } else {
      const key = `${classItem.course}-${classItem.section}`
      classMap.set(key, existing.docs[0].id)
      console.log(`  ⏭️  ${classItem.course} - Section ${classItem.section} (already exists)`)
    }
  }

  // ============================================================
  // 9. STUDENTS
  // ============================================================
  console.log('\n🎓 Creating Students...')

  const studentUsers = [
    {
      name: 'Soban Ahmad',
      email: 'soban@student.edu.pk',
      password: 'student123',
      rollNo: 'CS-2024-001',
      department: 'CS',
      batch: '2024-2028',
      gender: 'male',
    },
    {
      name: 'Fatima Zafar',
      email: 'fatima@student.edu.pk',
      password: 'student123',
      rollNo: 'CS-2024-002',
      department: 'CS',
      batch: '2024-2028',
      gender: 'female',
    },
    {
      name: 'Usman Ali',
      email: 'usman@student.edu.pk',
      password: 'student123',
      rollNo: 'SE-2024-001',
      department: 'SE',
      batch: '2024-2028',
      gender: 'male',
    },
  ]

  const studentMap = new Map()
  for (const student of studentUsers) {
    const userExists = await payload.find({
      collection: 'users',
      where: { email: { equals: student.email } },
    })

    const deptId = deptMap.get(student.department)
    const uniId = uniMap.get('University of the Punjab')
    const semKey = `${student.department}-Fall 2024-1`
    const semId = semMap.get(semKey)

    if (!deptId || !uniId || !semId) {
      console.log(`  ⚠️ Skipping ${student.name} - missing dependencies`)
      continue
    }

    let userId
    if (userExists.docs.length === 0) {
      const user = await payload.create({
        collection: 'users',
        data: {
          name: student.name,
          email: student.email,
          password: student.password,
          role: 'student',
          status: 'active',
          personalInfo: {
            phone: '+92 300 4444444',
            dateOfBirth: '2000-01-01',
            gender: student.gender,
            cnic: student.gender === 'male' ? '44444-4444444-4' : '55555-5555555-5',
          },
          address: {
            street: 'Student Hostel',
            city: 'Lahore',
            state: 'Punjab',
          },
        },
      })
      userId = user.id
    } else {
      userId = userExists.docs[0].id
    }

    // Check if student record exists
    const studentExists = await payload.find({
      collection: 'students',
      where: { rollNo: { equals: student.rollNo } },
    })

    if (studentExists.docs.length === 0) {
      const createdStudentRecord = await payload.create({
        collection: 'students',
        data: {
          user: userId,
          rollNo: student.rollNo,
          university: uniId,
          department: deptId,
          semester: semId,
          batch: student.batch,
          admissionDate: '2024-01-15',
        },
      })
      studentMap.set(student.email, createdStudentRecord.id)
      console.log(`  ✅ ${student.name} (${student.rollNo})`)
    } else {
      studentMap.set(student.email, studentExists.docs[0].id)
      console.log(`  ⏭️  ${student.name} (already exists)`)
    }
  }

  // ============================================================
  // 10. ENROLLMENTS
  // ============================================================
  console.log('\n📝 Creating Enrollments...')

  const enrollments = [
    { student: 'soban@student.edu.pk', class: 'CS101-A' },
    { student: 'soban@student.edu.pk', class: 'CS201-A' },
    { student: 'fatima@student.edu.pk', class: 'CS101-A' },
    { student: 'usman@student.edu.pk', class: 'SE201-A' },
  ]

  for (const enrollment of enrollments) {
    const studentId = studentMap.get(enrollment.student)
    const classId = classMap.get(enrollment.class)
    const deptCode = enrollment.class.startsWith('SE') ? 'SE' : 'CS'
    const deptId = deptMap.get(deptCode)
    const uniId = uniMap.get('University of the Punjab')
    const semKey = `${deptCode}-Fall 2024-1`
    const semId = semMap.get(semKey)

    if (!studentId || !classId || !deptId || !uniId || !semId) {
      console.log(`  ⚠️ Skipping enrollment for ${enrollment.student} in ${enrollment.class}`)
      continue
    }

    let existing = await payload.find({
      collection: 'enrollments',
      where: {
        and: [{ student: { equals: studentId } }, { class: { equals: classId } }],
      },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'enrollments',
        data: {
          student: studentId,
          class: classId,
          university: uniId,
          department: deptId,
          semester: semId,
          status: 'enrolled',
        },
      })
      console.log(`  ✅ ${enrollment.student.split('@')[0]} enrolled in ${enrollment.class}`)
    } else {
      console.log(
        `  ⏭️  ${enrollment.student.split('@')[0]} already enrolled in ${enrollment.class}`,
      )
    }
  }

  // ============================================================
  // 11. TIMETABLE
  // ============================================================
  console.log('\n📅 Creating Timetable Entries...')

  const timetables = [
    {
      class: 'CS101-A',
      day: 'monday',
      timeSlot: '09:00-10:00',
      room: 'Lab 1',
      lectureType: 'theory',
    },
    {
      class: 'CS101-A',
      day: 'wednesday',
      timeSlot: '09:00-10:00',
      room: 'Lab 1',
      lectureType: 'theory',
    },
    {
      class: 'CS101-B',
      day: 'tuesday',
      timeSlot: '09:00-10:00',
      room: 'Lab 2',
      lectureType: 'theory',
    },
    {
      class: 'CS101-B',
      day: 'thursday',
      timeSlot: '09:00-10:00',
      room: 'Lab 2',
      lectureType: 'theory',
    },
    {
      class: 'CS201-A',
      day: 'monday',
      timeSlot: '10:00-11:00',
      room: 'Room 101',
      lectureType: 'theory',
    },
    {
      class: 'CS201-A',
      day: 'wednesday',
      timeSlot: '10:00-11:00',
      room: 'Room 101',
      lectureType: 'theory',
    },
  ]

  for (const tt of timetables) {
    const classId = classMap.get(tt.class)
    const deptCode = tt.class.startsWith('CS101')
      ? 'CS'
      : tt.class.startsWith('CS201')
        ? 'CS'
        : 'CS'
    const deptId = deptMap.get(deptCode)
    const uniId = uniMap.get('University of the Punjab')
    const semKey = `${deptCode}-Fall 2024-1`
    const semId = semMap.get(semKey)
    const courseCode = tt.class.split('-')[0]
    const courseId = courseMap.get(courseCode)
    const teacherId = teacherMap.get('ali.raza@ums.edu.pk')

    if (!classId || !deptId || !uniId || !semId || !courseId || !teacherId) {
      console.log(`  ⚠️ Skipping timetable for ${tt.class}`)
      continue
    }

    let existing = await payload.find({
      collection: 'timetable',
      where: {
        and: [
          { class: { equals: classId } },
          { day: { equals: tt.day } },
          { timeSlot: { equals: tt.timeSlot } },
        ],
      },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'timetable',
        data: {
          class: classId,
          day: tt.day,
          timeSlot: tt.timeSlot,
          room: tt.room,
          university: uniId,
          department: deptId,
          semester: semId,
          teacher: teacherId,
          subject: courseId,
          lectureType: tt.lectureType,
          status: 'active',
        },
      })
      console.log(`  ✅ ${tt.class} - ${tt.day} ${tt.timeSlot}`)
    } else {
      console.log(`  ⏭️  ${tt.class} - ${tt.day} ${tt.timeSlot} (already exists)`)
    }
  }

  // ============================================================
  // 12. TEACHER SALARY (Optional)
  // ============================================================
  console.log('\n💰 Setting up Teacher Salary...')

  const permanentTeacherId = teacherMap.get('ali.raza@ums.edu.pk')
  if (permanentTeacherId) {
    const salaryExists = await payload.find({
      collection: 'teacher-salary',
      where: { teacher: { equals: permanentTeacherId } },
    })

    if (salaryExists.docs.length === 0) {
      await payload.create({
        collection: 'teacher-salary',
        data: {
          teacher: permanentTeacherId,
          teacherType: 'permanent',
          fixedSalary: 100000,
          bonus: 5000,
          deductions: {
            tax: 10000,
            otherDeduction: 2000,
          },
          effectiveFrom: '2024-01-01',
          status: 'active',
        },
      })
      console.log('  ✅ Dr. Ali Raza - Permanent Teacher Salary configured')
    } else {
      console.log('  ⏭️ Teacher salary already exists')
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📊 Summary:')
  console.log(`  ✅ Universities: ${universities.length}`)
  console.log(`  ✅ Departments: ${departments.length}`)
  console.log(`  ✅ Semesters: ${semesters.length}`)
  console.log(`  ✅ Courses: ${courses.length}`)
  console.log(`  ✅ Admin: 1`)
  console.log(`  ✅ Coordinator: 1 (Multiple departments: CS, SE, IT)`)
  console.log(`  ✅ Teachers: ${teachers.length}`)
  console.log(`  ✅ Students: ${studentUsers.length}`)
  console.log(`  ✅ Classes: ${classes.length}`)
  console.log(`  ✅ Enrollments: ${enrollments.length}`)
  console.log(`  ✅ Timetable: ${timetables.length}`)
  console.log('\n🔑 Login Credentials:')
  console.log('  👑 Admin:      admin@ums.edu.pk / admin123')
  console.log('  👔 Coordinator: coordinator@ums.edu.pk / coord123')
  console.log('  👨‍🏫 Teacher:    ali.raza@ums.edu.pk / teacher123')
  console.log('  🎓 Student:    soban@student.edu.pk / student123')
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  process.exit(0)
}

seed()
