// src/app/(payload)/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
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

    response =
      `📚 Available Courses:\n` +
      courses.docs.map((c) => `- ${c.code}: ${c.title} (${c.creditHours} credits)`).join('\n')
  }

  // Class schedule queries
  else if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
    const classes = await payload.find({
      collection: 'classes',
      limit: 5,
      depth: 2,
    })

    response =
      `📅 Upcoming Classes:\n` +
      classes.docs
        .map((c) => `- ${c.course?.code}: ${c.days?.join(', ')} at ${c.timeSlot}`)
        .join('\n')
  }

  // Teacher queries
  else if (lowerMessage.includes('teacher') || lowerMessage.includes('faculty')) {
    const teachers = await payload.find({
      collection: 'users',
      where: { role: { equals: 'teacher' } },
      limit: 5,
    })

    response =
      `👨‍🏫 Faculty Members:\n` + teachers.docs.map((t) => `- ${t.name} (${t.email})`).join('\n')
  }

  // Default response
  else {
    response =
      `🤖 I'm your UMS Assistant! I can help you with:\n` +
      `• Course information\n` +
      `• Class schedules\n` +
      `• Teacher details\n` +
      `• Student enrollment\n\n` +
      `What would you like to know?`
  }

  return NextResponse.json({ response })
}
