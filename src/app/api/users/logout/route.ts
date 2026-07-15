import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const res = NextResponse.json({ success: true })

    // Clear the auth cookie
    res.cookies.delete('payload-token')

    return res
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 })
  }
}
