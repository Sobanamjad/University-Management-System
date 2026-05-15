// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json()

    const payload = await getPayload({ config })

    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase()

    let response = ''

    // Course queries
    if (lowerMessage.includes('course') || lowerMessage.includes('subject')) {
      const courses = await payload.find({
        collection: 'courses',
        limit: 5,
        depth: 1,
      })

      if (courses.docs.length === 0) {
        response = '📚 No courses found in the system.'
      } else {
        response =
          `📚 **Available Courses:**\n\n` +
          courses.docs
            .map((c: any) => `• ${c.code}: ${c.title} (${c.creditHours} credits)`)
            .join('\n')
      }
    }

    // Class schedule queries
    else if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
      const classes = await payload.find({
        collection: 'classes',
        limit: 5,
        depth: 2,
      })

      if (classes.docs.length === 0) {
        response = '📅 No classes scheduled.'
      } else {
        response =
          `📅 **Upcoming Classes:**\n\n` +
          classes.docs
            .map((c: any) => {
              // Handle both populated course object or just ID
              const courseCode = c.course && typeof c.course === 'object' ? c.course.code : 'N/A'
              const days = c.days && Array.isArray(c.days) ? c.days.join(', ') : 'N/A'
              const timeSlot = c.timeSlot || 'N/A'
              return `• ${courseCode}: ${days} at ${timeSlot}`
            })
            .join('\n')
      }
    }

    // Teacher queries
    else if (lowerMessage.includes('teacher') || lowerMessage.includes('faculty')) {
      const teachers = await payload.find({
        collection: 'users',
        where: { role: { equals: 'teacher' } },
        limit: 5,
      })

      if (teachers.docs.length === 0) {
        response = '👨‍🏫 No teachers found in the system.'
      } else {
        response =
          `👨‍🏫 **Faculty Members:**\n\n` +
          teachers.docs.map((t: any) => `• ${t.name} (${t.email})`).join('\n')
      }
    }

    // Student queries
    else if (lowerMessage.includes('student') || lowerMessage.includes('admission')) {
      const students = await payload.find({
        collection: 'students',
        limit: 5,
        depth: 1,
      })

      if (students.docs.length === 0) {
        response = '🎓 No students enrolled yet.'
      } else {
        response =
          `🎓 **Recent Students:**\n\n` +
          students.docs.map((s: any) => `• ${s.displayTitle || s.rollNo}`).join('\n')
      }
    }

    // Department queries
    else if (lowerMessage.includes('department') || lowerMessage.includes('dept')) {
      const departments = await payload.find({
        collection: 'departments',
        limit: 10,
      })

      if (departments.docs.length === 0) {
        response = '🏛️ No departments found.'
      } else {
        response =
          `🏛️ **Departments:**\n\n` +
          departments.docs.map((d: any) => `• ${d.name} (${d.code})`).join('\n')
      }
    }

    // Default response
    else {
      response =
        `🤖 **Hi! I'm your UMS Assistant.**\n\nI can help you with:\n` +
        `• 📚 **Course information** (type "courses" or "subjects")\n` +
        `• 📅 **Class schedules** (type "classes" or "schedule")\n` +
        `• 👨‍🏫 **Teacher details** (type "teachers" or "faculty")\n` +
        `• 🎓 **Student information** (type "students")\n` +
        `• 🏛️ **Department info** (type "departments")\n\n` +
        `**What would you like to know?**`
    }

    return NextResponse.json({ response, success: true })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { response: 'Sorry, I encountered an error. Please try again later.', success: false },
      { status: 500 },
    )
  }
}
