// src/app/api/users/register/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, status, personalInfo, address } = body

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { errors: [{ message: 'Name, email and password are required.' }] },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { errors: [{ message: 'Password must be at least 6 characters.' }] },
        { status: 400 },
      )
    }

    // Only allow public roles — prevent privilege escalation
    const allowedRoles = ['student', 'teacher', 'coordinator']
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json(
        { errors: [{ message: 'Invalid role selected.' }] },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const user = await payload.create({
      collection: 'users',
      overrideAccess: false, // Enforce the publicCreate access rule
      data: {
        name,
        email,
        password,
        role: role || 'student',
        status: status || 'active',
        personalInfo: personalInfo ?? {},
        address: address ?? {},
      },
    })

    return NextResponse.json(
      { message: 'Account created successfully.', id: user.id },
      { status: 201 },
    )
  } catch (err: unknown) {
    const error = err as { message?: string; data?: unknown }

    // Surface Payload validation errors clearly
    if (error?.data) {
      return NextResponse.json({ errors: error.data }, { status: 400 })
    }

    return NextResponse.json(
      { errors: [{ message: error?.message || 'Registration failed.' }] },
      { status: 500 },
    )
  }
}
